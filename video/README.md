# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Generate voiceovers and sound effects (ElevenLabs)**

Set `ELEVENLABS_API_KEY` in your environment or in `.env` (copy `.env.example`), describe the clips in `audio.config.json`, then run:

```console
npm run audio              # only missing files
npm run audio -- --force   # regenerate all
npm run audio -- whoosh    # only specific ids
```

Voiceovers are written to `public/voiceover/<id>.mp3` and sound effects to `public/sfx/<id>.mp3`. Use them in a composition with `<Audio src={staticFile("sfx/whoosh.mp3")} />`.

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
