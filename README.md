# serilum-forge-maven
A manual maven for library mods on Serilum's CurseForge.

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
- [Collective](https://www.curseforge.com/minecraft/mc-mods/collective)


### Discontinued library mods:
- [Find A Block (FAB) Library](https://www.curseforge.com/minecraft/mc-mods/fab-library)
- [Spawn A Mob (SAM) Library](https://www.curseforge.com/minecraft/mc-mods/sam-library)
