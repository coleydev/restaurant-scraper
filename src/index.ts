import { cleanDocument, extractLinks } from "./utils";
import { SEARCHED_URLS } from "./constants";
import { MenuScore, isMenuOnPage, rankMenuLinks } from "./find_menu";
import { analyseImage, analysePdf, analyseText } from "./openai";
import { fetchPage } from "./utils";

/**
 * Parses the urls passed as arguments and returns a list of URLs
 */
function parseUrls(urls: string[]): URL[] {
  let parsedUrls: URL[] = [];
  for (const url of urls) {
    try {
      parsedUrls.push(new URL(url));
    } catch (e) {
      console.error(e, url);
    }
  }
  return parsedUrls;
}

/**
 * Recursively checks if the page is a menu. If it isn't, tries to find a link
 * that might be a menu.
 */
async function runParser(url: URL): Promise<MenuScore | undefined> {
  const result = await isMenuOnPage(url);

  if (result.score > 0.5) {
    console.log("Potential menu", url.href, result);
    return result;
  }

  // Otherwise, check the links on the page

  const html: string | undefined = await fetchPage(url);
  if (!html) {
    console.error("No html found");
    return;
  }
  const body = cleanDocument(html);
  if (!body) {
    console.error("No body found");
    return;
  }
  const links = extractLinks(body).filter(
    (link) =>
      SEARCHED_URLS.find((val) => val.href === link.href) === undefined &&
      link.href.length > 0
  );
  const ranked = rankMenuLinks(links)
    .filter((link) => link.rank >= 0)
    .sort((a, b) => a.rank - b.rank);
  console.log(ranked);

  for (const link of ranked) {
    let res = await runParser(new URL(link.link.href));
    if (res && res.score > 0.5) {
      return res;
    }
  }
}

/**
 * Sends the menu to OpenAI and handles the response
 */
async function handleMenuOutput(url: URL, res: MenuScore) {
  switch (res.type) {
    case "PDF":
      // Download PDF
      console.log(await analysePdf(url));
      break;
    case "IMAGE":
      // Download image
      console.log(await analyseText(url));
      break;
    case "TEXT":
      // Download text
      console.log(await analyseImage(url));
      break;
  }
}

async function main() {
  const rawUrls = process.argv.slice(2);

  const urls = parseUrls(rawUrls);

  for (const url of urls) {
    let res = await runParser(url);
    if (res) {
      console.log("Found menu", url.href, res);
      await handleMenuOutput(url, res);
    }
  }
}

main();
