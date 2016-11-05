---
layout: post
title: "Maven memo: adding a local jar"
tags: [java]
---

Maven is an interesting tool. It helps to create more well designed packaged
project and it is the basis to other tools like `Ivy` or `Gradle`.

But still, the Maven way is so obsessed with imposing best practices that it can
be incredibly hard to use it with edge cases. One case that I often encounter is
to simply use a local `jar` 3rd party file as a library without putting it in a
Maven repository.

This post is a memo to remind the different possibilities of achieving that.

<!-- more -->

* This will become a table of contents (this text will be scraped).
{:toc}

Let's suppose you have a `sample-lib.jar` file you want to add to your Maven
project. To be compatible with the Maven way, you will also have to define
some information. Here, we will use:

>     groupId: net.alea.test
>     artifactId: sample-lib
>     version: 1.0

The project has the usual structure:

```
my-app
|--src
|  `--main/java/App.java
`--pom.xml
```

## Idea 1: Set the `jar`  as a system library

The easiest to add a local library to a maven project is to set is as a system
library. A `lib` folder can be created at the root of the project and the `jar`
can be copied there.

```
my-app
|--lib
|  `--sample-lib.jar
|--src
|  `--main/java/App.java
`--pom.xml
```

Content of **`pom.xml`** file:

```xml
<project>
  <!-- ... -->
  <dependencies>

    <dependency>
        <groupId>net.alea.test</groupId>
        <artifactId>sample-lib</artifactId>
        <version>1.0</version>
        <scope>system</scope>
        <systemPath>${project.basedir}/lib/sample-lib.jar</systemPath>
    </dependency>

  </dependencies>
  <!-- ... -->
</project>
```

There is no simpler way to manually add a library and to distribute the project
with the 3rd party library through a code versionning system.

**Caveats**

There is however a huge drawback depending on the way you use your Maven project.

If you use plugins to generate a fat jar, system libraries are not pulled into
the fat jar since system libraries are supposed to already be present in the
target operating system.

## Idea 2: Add the `jar` in Maven cache

This is the usual recommended way in Maven documentation.

Actually, all dependencies are downloaded by Maven and installed in the `~/.m2`
directory. The idea is to simply copy your library in there with the correct
directory structure.

2 possibilities:

1) If your `jar` was created using Maven and if it contains a `pom.xml` file or
you have it somewhere, type:

```shell
mvn install:install-file \
    -Dfile=sample-lib.jar \
    -DpomFile=sample-lib.pom
```

Or even better by forcing a more recent plugin version that can search for the
`pom` file inside the `jar`:

```shell
mvn org.apache.maven.plugins:maven-install-plugin:2.5.2:install-file \
    -Dfile=sample-lib.jar
```

2) If no `sample-lib.pom` file exists at all, you will have to give more
information so Maven can generate one:

```shell
mvn install:install-file \
    -Dfile=sample-lib.jar \
    -DgroupId=net.alea.test \
    -DartifactId=sample-lib \
    -Dpackaging=jar \
    -Dversion=1.0
```

You can then reference the `jar` as a usual dependecy in your **`pom.xml`**:

```xml
<project>
  <!-- ... -->
  <dependencies>

    <dependency>
        <groupId>net.alea.test</groupId>
        <artifactId>sample-lib</artifactId>
        <version>1.0</version>
    </dependency>

  </dependencies>
  <!-- ... -->
</project>
```

**Caveats**

Since the library must manually be installed, you will have to ask developers to
also manually do the setup on their computers. You can distribute the lib with a
setup script that will automatically do the installation, but it also means that
your project will not work out of the box if you distribute it to other people.

You must also have in mind to install the library when you use some automation
build tools on other machines.

## Idea 3: Local Repository

An alternative to the Maven cache and to a network repository is to use a
local repository. By creating this local repository inside your project,
you will be able to also distribute it using your favorite code versionning
tool.

Note that this local repository will not substitute to the Maven cache:
libraries will always be copied in the cache.

### Creating a local repository

It is globally the same idea than installing files in the Maven cache, but
a different target directory is chosen.

For instance, if you create a `lib-maven` directory in your project, you can
then install your `jar` in it (2 ways to do that):

1) If your `jar` library was created using Maven and if it contains a `pom` file
or you have it somewhere:

```shell
mvn install:install-file \
    -Dfile=sample-lib.jar \
    -DpomFile=sample-lib.pom \
    -DlocalRepositoryPath=./lib-maven
```

Or even better by forcing a more recent plugin version that can search for the
`pom` file inside the `jar`:

```shell
mvn org.apache.maven.plugins:maven-install-plugin:2.5.2:install-file \
    -Dfile=sample-lib.jar \
    -DlocalRepositoryPath=../lib-maven
```

2) If no `pom` file exists at all, you will have to give more information:

```shell
mvn install:install-file \
    -Dfile=sample-lib.jar \
    -DgroupId=net.alea.test \
    -DartifactId=sample-lib \
    -Dversion=1.0 \
    -Dpackaging=jar \
    -DlocalRepositoryPath=./lib-maven
```

Those commands create a directory hierarchy, your project will change to
something like that:

```
my-app
|--lib-maven
|  `--net/alea/test
|     |--maven-metadata-local.xml
|     `--1.0
|         |--maven-metadata-local.xml
|         |--sample-lib-1.0.jar
|         `--sample-lib-1.0.pom
|--src
|  `--main/java/App.java
`--pom.xml
```

The second step is to configure the directory of this local repository in the
`pom.xml` of your project.

```xml
<project>
  <!-- ... -->
  <repositories>
    <repository>
      <id>my-local-repo</id>
      <url>file://${project.basedir}/lib-maven/</url>
    </repository>
  </repositories>

  <dependencies>
    <dependency>
        <groupId>net.alea.test</groupId>
        <artifactId>sample-lib</artifactId>
        <version>1.0</version>
    </dependency>
  </dependencies>
  <!-- ... -->
</project>
```

**Caveats**

No real problem, it works perfectly.
When someone launches a `mvn` command, dependencies will also be looked into
the local repository and then transparently copied in the Maven cache.

The only thing is to correctly use the maven commands, even to update the `jar`.
**You must also change the version of the `jar` library in case of an update,
otherwise Maven will not recognize that it was updated.** IF you just replace
the same `jar` and someone already build your project, the new `jar` will not be
detected and the old version is used.

It should also be used for end-project, and not for distribuable `jar`
libraries since the local repository configuration will stay in the pom file.
There is not sense in distributing a library that depends on local resources.

### Auto install

While the local repository mechanism work, the problem is Maven does not
automatically take into account the `jar` if you update it using the same
version umber. By default, you have to manually delete in the Maven cache your
library (e.g. at `~/.m2/repository/net/alea/test` in our case).

You can add the following in your `pom.xml` if you want Maven cache to
be automatically refreshed:

```xml
<project>
  <!-- ... -->
  <build>
    <plugins>
      <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-install-plugin</artifactId>
          <executions>
              <execution>
                  <id>copy-jar</id>
                  <phase>validate</phase>
                  <goals>
                      <goal>install-file</goal>
                  </goals>
                  <configuration>
                      <file>lib-maven/net/alea/test/sample-lib/1.0/sample-lib.jar</file>
                      <repositoryLayout>default</repositoryLayout>
                      <groupId>net.alea.test</groupId>
                      <artifactId>sample-lib</artifactId>
                      <version>1.0</version>
                      <packaging>jar</packaging>
                  </configuration>
              </execution>
          </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

It is quite an hack, all the more since you will have to do the same `plugin`
block to take into account other potential `jar` files. The previous section
about installing the `jar` in a local repository is also a prerequisite.

### Snapshot libraries

If you need to frequently change your `jar` library, using Maven SNAPSHOT may
be better than using the above technique.

Unfortunately, we have to use the `deploy` Maven plugin that does not know how
to retrieve a `pom` file in a jar, so you will have to provide the `pom` file or
to describe the `jar`.

You do not need to use the previous `mvn install:install-file` command to create
the local repository before. Each time you want to install or update a new
SNAPSHOT version of a `jar` in your local repository:

```shell
mvn deploy:deploy-file \
  -Dfile=sample-lib-1.0-SNAPSHOT.jar \
  -Durl='file://${basedir}/lib-maven' \
  -DpomFile=sample-lib-1.0-SNAPSHOT.pom
```

or

```shell
mvn deploy:deploy-file \
  -Dfile=sample-lib-1.0-SNAPSHOT.jar \
  -Durl='file://${basedir}/lib-maven' \
  -DgroupId=net.alea.test \
  -DartifactId=sample-lib \
  -Dversion=1.0-SNAPSHOT \
  -Dpackaging=jar \
```

**`pom.xml`** file:

```xml
<project>
  <!-- ... -->
  <repositories>
    <repository>
      <id>my-local-repo</id>
      <url>file://${project.basedir}/lib-maven/</url>
      <snapshots>
        <updatePolicy>always</updatePolicy>
      </snapshots>
    </repository>
  </repositories>

  <dependencies>
    <dependency>
        <groupId>net.alea.test</groupId>
        <artifactId>sample-lib</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>
  </dependencies>
  <!-- ... -->
</project>
```

**Caveats**

Each time you update the `jar`, a new copy is created in the local repository,
and old versions are not erased. It may be a problem if you use some code
versionning tool, do not forget to manually remove the previous `jar`.

### Parent and modules

In case of a parent & modules Maven hierarchy, if several modules needs your
`jar`, you may want to use the same local repository for all the modules.

```
my-app
|--lib-maven
|--module1
|  `--pom.xml
|--module2
|  `--pom.xml
|--module3
|  `--pom.xml
`--pom.xml
```

It is possible for each module `pom` to relatively reference the local
repository:

```xml
<project>
  <!-- ... -->
  <repositories>
    <repository>
      <id>my-local-repo</id>
      <url>file://${project.basedir}/../lib-maven/</url>
    </repository>
  </repositories>
  <!-- ... -->
</project>
```

However you may also want to factorize the local repository definition in the
parent `pom`.

Maven is really bad when you want to work with relative path outside of your
module or project. You can use the  `${project.basedir}` variable inside the
parent `pom`, but it will point to the path of the currently build module.

The consequence is that if you write in the parent `pom` that the local
repository is at:

    file://${project.basedir}/lib-maven/

... when Maven builds `module1`, it will process it as if the local repository
is at:

    my-app/module1/lib-maven/

... whereas it should be:

    my-app/lib-maven/

To solve this problem, the trick is to store `${project.basedir}` in a new
variable in the parent `pom`, and then modify this variable in each module:

 **Parent `pom.xml`**:

```xml
<project>
  <groupId>net.alea.test</groupId>
  <artifactId>my-app</artifactId>
  <packaging>pom</packaging>
  <version>1.0-SNAPSHOT</version>
  <!-- ... -->
  <properties>
    <!-- Trick to allows access from submodules -->
    <main.basedir>${project.basedir}</main.basedir>
  </properties>
  <repositories>
    <repository>
      <id>my-local-repo</id>
      <url>file://${main.basedir}/lib-maven/</url>
    </repository>
  </repositories>
  <!-- ... -->
</project>
```

 **Module 1 `pom.xml`**:

```xml
<project>
    <parent>
      <groupId>net.alea.test</groupId>
      <artifactId>my-app</artifactId>
      <version>1.0-SNAPSHOT</version>
    </parent>
  <!-- ... -->
  <properties>
    <main.basedir>${project.basedir}/..</main.basedir>
  </properties>
  <!-- ... -->
</project>
```
