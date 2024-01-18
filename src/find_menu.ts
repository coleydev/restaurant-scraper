import { fetchPage } from "./utils";
import { MENU_TEXT_RANK } from "./constants";
import { cleanDocument } from "./utils";

/**
 * Ranks the links based on the text in the link. The lower, the better.
 * In reality, we'd likely have several indicators as to whether a link
 * is pointing towards a menu or not.
 */
export function rankMenuLinks(links: HTMLAnchorElement[]) {
  return links.map((link) => {
    return {
      link,
      rank: linkRanker(link),
    };
  });
}

/**
 * Ranks the link based on a list of words.
 * If the link contains the word, it gets a score. The lower, the better
 * If the link doesn't contain any word, it gets a score of -1
 * @param link
 * @returns number
 */
function linkRanker(link: HTMLAnchorElement): number {
  let score: number | undefined = undefined;
  const text = link.text.toLowerCase().trim();
  const href = link.href.toLowerCase().trim();
  for (let i = 0; i < MENU_TEXT_RANK.length; i++) {
    let word = MENU_TEXT_RANK[i];
    if (text.includes(word) || href.includes(word)) {
      score = i;
      break;
    }
  }
  console.log(text, href, score);

  return score ?? -1;
}

const INDICATORS = [
  { key: ".pdf", value: 0.8 },
  { key: ".jpg", value: 0.5 },
  { key: ".png", value: 0.5 },
  { key: ".jpeg", value: 0.5 },
  //   { key: ".doc", value: 0.5 },
];

export interface MenuScore {
  score: number;
  type: "PDF" | "IMAGE" | "TEXT";
}

/**
 * Very basic example of the logic I'd implement to check if a page is a menu.
 * This is the final step before the page is sent to LLM.
 * Returns a confidence score between 0 and 1 (currently arbitrary -
 * assumes if it's a PDF it's probably a menu, or if there's a lot of dollar signs).
 */
export async function isMenuOnPage(url: URL): Promise<MenuScore> {
  // If URL is a particular file type, return a confidence score and the estimated file type
  for (const indicator of INDICATORS) {
    if (url.href.includes(indicator.key)) {
      if (indicator.key === ".pdf") {
        return { score: indicator.value, type: "PDF" };
      } else {
        return { score: indicator.value, type: "IMAGE" };
      }
    }
  }

  // Else, check the page content
  const raw = await fetchPage(url);
  const document = cleanDocument(raw ?? "");

  if (!document || !document.innerHTML) {
    return { score: 0, type: "TEXT" };
  }

  let i = 0;
  for (const match of document.innerHTML.matchAll(/\$/g)) {
    console.log(match);
    i++;
    if (i > 5) {
      // If there are more than 5 dollar signs, it's probably a menu
      break;
    }
  }
  if (i > 5) {
    return { score: 0.8, type: "TEXT" };
  }
  if (i > 0) {
    return { score: i * 0.2, type: "TEXT" };
  }

  return { score: 0, type: "TEXT" };
}
