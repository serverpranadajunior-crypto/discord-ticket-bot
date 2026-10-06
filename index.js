const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // ABRIR TICKET
  if (interaction.customId === "abrir_ticket") {
    const guild = interaction.guild;

    const existente = guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.id}`
    );

    if (existente) {
      return interaction.reply({
        content: `❌ Você já possui um ticket aberto: ${existente}`,
        ephemeral: true
      });
    }

    let categoria = guild.channels.cache.find(
      c => c.name === "🎫 TICKETS" &&
      c.type === ChannelType.GuildCategory
    );

    if (!categoria) {
      categoria = await guild.channels.create({
        name: "🎫 TICKETS",
        type: ChannelType.GuildCategory
      });
    }

    const canal = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: categoria.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket aberto!")
      .setDescription(
        `Olá ${interaction.user}!\n\n` +
        "Explique sua dúvida ou solicitação e aguarde nossa equipe.\n\n" +
        "🔒 Quando terminar, utilize o botão abaixo para fechar o ticket."
      );

    const fechar = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("fechar_ticket")
        .setLabel("Fechar Ticket")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [fechar]
    });

    await interaction.reply({
      content: `✅ Seu ticket foi criado: ${canal}`,
      ephemeral: true
    });
  }

  // FECHAR TICKET
  if (interaction.customId === "fechar_ticket") {
    await interaction.reply("🔒 Este ticket será fechado em 5 segundos.");

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(process.env.TOKEN);
