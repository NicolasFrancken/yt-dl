import ytdl from "ytdl-core";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import Ffmpeg from "fluent-ffmpeg";

import { NextResponse } from "next/server";

Ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function POST(req) {
  const { videoLink } = await req.json();

  try {
    const video = await download(videoLink);

    if (video) {
      try {
        const secondResponse = await convert(video);

        return NextResponse.json(secondResponse.message);
      } catch (e) {
        throw e;
      }
    } else {
      return NextResponse.json({ message: "Something went wrong..." });
    }
  } catch (e) {
    throw e;
  }
}

async function download(videoLink) {
  const videoId = ytdl.getURLVideoID(videoLink);
  const video = ytdl(videoId, { format: "webm", filter: "audioonly" });
  return video;
}

async function convert(video) {
  const outputFilePath = "./audio.mp3";
  // .webm to .mp3 conversion
  return new Promise(async (resolve, reject) => {
    console.log("Starting conversion");
    Ffmpeg()
      .input(video)
      .toFormat("mp3")
      .output(outputFilePath)
      .on("end", () => {
        console.log("Conversion successful");
        resolve({ message: "Success!" });
      })
      .on("error", (err) => {
        console.error("There was an error with ffmpeg", err);
        reject(err);
      })
      .run();
  });
}
