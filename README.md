## A manual maven for Serilum's Minecraft mods.

To add the repository to your project, add this to your **build.gradle**:

```gradle
repositories {
  maven {
    url = "https://github.com/Serilum/.maven/raw/maven/"
  }
}
```

And refresh your workspace by entering the following command in your project folder: 

```
$ gradlew --refresh-dependencies
```

# Active library mods:
- [Collective](https://curseforge.com/minecraft/mc-mods/collective)


### Discontinued library mods:
- [Find A Block (FAB) Library](https://curseforge.com/minecraft/mc-mods/fab-library)
- [Spawn A Mob (SAM) Library](https://curseforge.com/minecraft/mc-mods/sam-library)
