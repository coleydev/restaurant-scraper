import OpenAI from "openai";
import { MenuScore } from "./find_menu";
import { cleanDocument, downloadBlob } from "./utils";
import { isUploadable } from "openai/uploads";
import { fetchPage } from "./utils";

// const openai = new OpenAI({
//   organization: process.env.OPENAI_ORG,
//   apiKey: process.env.OPENAI_API_KEY,
// });

const fs = require("fs");

// NOTE: Rough sketch of sending menu to OpenAI. PDFs I'm not sure if OpenAI takes them
// (they allow file uploads for assistants) but one alternative would be to use a PDF
// parser to extract the text and send that to OpenAI, OR turn the pdf into an image
// and send that to OpenAI's image model.

// All OpenAI implementation is disabled as I don't have an API key.

export async function analysePdf(url: URL) {
  const pdf = new File([await downloadBlob(url)], url.hostname);
  //   const fileData = await openai.files.create({
  //     file: new File([await downloadBlob(url)], url.hostname),
  //     purpose: "assistants",
  //   });
  //   JSON.parse(result[0].choices[0].text)
  return [{ item_name: "test", item_price: 16 }];
}

export async function analyseText(url: URL) {
  const document = await cleanDocument((await fetchPage(url)) ?? "");
  if (!document) {
    return;
  }
  const text = document.textContent?.trim();
  const prompt = `The HTML below contains a menu. Parse the html and provide a JSON object with the following properties: [{item_name: string, item_price: number}]\n\n${text}`;
  //   const result = await openai.chat.completions.create({
  //     messages: [{ role: "user", content: prompt }],
  //     model: "davinci",
  //   });
  //   console.log(result[0]);
  //  return JSON.parse(result[0].choices[0].text);

  return [{ item_name: "test", item_price: 10 }];
}
export async function analyseImage(url: URL) {
  const prompt =
    "This image contains a menu. Parse the html and provide a JSON object with the following properties: [{item_name: string, item_price: number}]";
  //   const result = await openai.chat.completions.create({
  //     model: "gpt-4-vision-preview",
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           { type: "text", text: prompt },
  //           {
  //             type: "image_url",
  //             image_url: url.href,
  //           },
  //         ],
  //       },
  //     ],
  //   });
  //   console.log(result[0]);
  //   JSON.parse(result[0].choices[0].text)
  return [{ item_name: "test", item_price: 12 }];
}
