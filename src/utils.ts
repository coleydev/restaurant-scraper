import { JSDOM } from "jsdom";
import * as fs from "node:fs";
import { HEADERS, SEARCHED_URLS } from "./constants";

function removeChildrenRecursive(element: HTMLElement, nodeType: string): void {
  element.querySelectorAll(nodeType).forEach((node) => {
    node.parentElement?.removeChild(node);
  });
}
function removeCommentsRecursive(element: HTMLElement): void {
  element.querySelectorAll("*").forEach((node) => {
    if (node.nodeType === 8) {
      node.parentElement?.removeChild(node);
    }
  });
}
function removeAttributeRecursive(element: HTMLElement, attribute: string) {
  element.querySelectorAll("*").forEach((node) => {
    node.removeAttribute(attribute);
  });
}
export function cleanDocument(html: string): HTMLElement | undefined {
  const dom = new JSDOM(html);

  const body = dom.window.document.querySelector("body");
  if (!body) {
    console.error("No body found");
    return;
  }
  ["style", "script", "svg", "g"].forEach((nodeType) => {
    removeChildrenRecursive(body, nodeType);
  });
  removeAttributeRecursive(body, "style");
  removeCommentsRecursive(body);
  return body;
}
export function extractLinks(element: HTMLElement): HTMLAnchorElement[] {
  const links = element.querySelectorAll("a");
  for (const link of links) {
    console.log(
      link.href,
      link.innerText,
      link.text.trim(),
      link.textContent?.trim()
    );
  }

  return Array.from(links);
}

export async function downloadBlob(url: URL): Promise<Blob> {
  const blob = fetch(url.href).then((res) => res.blob());
  return blob;
}

export async function fetchPage(url: URL): Promise<string | undefined> {
  const encodedUrl = encodeURIComponent(url.href);
  const filePath = `./src/.cache/${encodedUrl}.html`;
  SEARCHED_URLS.push(url);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }
  const res = await fetch(url, {
    method: "GET",
    referrer: "http://www.google.com/",
    headers: HEADERS,
  }).then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      console.error(response.json().then((json) => json));
    }
  });
  if (!res) {
    return;
  }
  fs.writeFile(filePath, res, "utf8", () => {});
  return res;
}
