## A manual maven for Serilum's Minecraft mods.

Browse it at **[maven.serilum.com](https://maven.serilum.com/)**.

To add the repository to your project, add this to your **build.gradle**:

```gradle
repositories {
  maven {
    url = "https://maven.serilum.com/"
  }
}
```

The old raw URL keeps working too:

```gradle
url = "https://github.com/Serilum/.maven/raw/maven/"
```

And refresh your workspace by entering the following command in your project folder:

```
$ gradlew --refresh-dependencies
```

# Active library mods:
- [Collective](https://curseforge.com/minecraft/mc-mods/collective) (`com.natamus.collective-ml:collective`)


### Discontinued library mods:
- [Find A Block (FAB) Library](https://curseforge.com/minecraft/mc-mods/fab-library)
- [Spawn A Mob (SAM) Library](https://curseforge.com/minecraft/mc-mods/sam-library)

---

### How the frontend is built

The landing page (`index.html` + `assets/`) is plain HTML/CSS/JS and reads
`versions.json`. That file, the per-artifact `maven-metadata.xml`, and a static
`index.html` directory listing in every folder (a browsable file index, enhanced
by `assets/browse.js` for instant in-place navigation and sorting) are all
generated from the `com/` tree by `scripts/build_maven_index.py`. A GitHub Action
(`.github/workflows/build-index.yml`) reruns it whenever artifacts are pushed.
Deployed to Cloudflare Pages (`wrangler.toml`) from this `maven` branch.

Regenerate locally after adding artifacts:

```
$ python3 scripts/build_maven_index.py
```
