import { Colours } from "../colours.mjs"
import { NoDataError } from "../errors.mjs"
import { slashCommand } from "../models/slashCommand.mjs"
import { randomInt } from "crypto"
import { EmbedBuilder } from "discord.js"

const images = [
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299650563616828/2C326BCB-ED8B-4AA8-B8FF-EF5742B11412.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299651050147910/5DCC574F-223D-4389-A021-39AFA202354D.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299651452817558/6D166294-19CB-4002-8B9D-B91131491A95.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299651876434033/17FC63A7-79CF-4FB5-9BDA-0F16F94021F0.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299652321038416/1218C0F3-56EE-48F4-81DE-6D6866B8A5D2.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299652853706762/21425F22-E8DC-4F92-AACA-A173F05B6C2D.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299653336043570/99737CB4-9165-4C22-B76F-09B61C482B01.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299653763870801/7951909A-96AD-4D9E-87F7-C958F214B05C.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299654225236109/B81EE7BE-35CD-4F0E-B106-A7F0DA30C7DE.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299654636294204/BEF86CF1-B7C1-4EF9-BE77-42C5E6EFE0FA.png",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299669719011328/CA3CCE31-BF66-45BA-A282-83F6AE4FB981.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299670100672643/CAF40926-3917-42D4-8008-E0C3213E96C0.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299670499147926/DFD03BEE-51BB-48D7-A64F-B6C42B26C703.jpg",
  "https://cdn.discordapp.com/attachments/1125446368002052186/1127299670859862237/EC67032B-1FF2-4C74-B266-4E2E5A0B183C.jpg",
]

export const PickleCommand = slashCommand({
  name: "pickle",
  description: "Sends a picture of Lemons's bird Pickle",
  defaultMemberPermissions: null,
  dmPermission: true,
  nsfw: false,
  async handle(interaction) {
    const image = images[randomInt(images.length)]
    if (!image) {
      throw new NoDataError("No images")
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("piggle!😊😊")
          .setImage(image)
          .setColor(Colours.green[700]),
      ],
    })
  },
})
