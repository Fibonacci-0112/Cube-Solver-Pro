# Cube Solver Pro

Cube Solver Pro is a native **.NET MAUI Blazor Hybrid** speedcubing timer, scramble generator, algorithm trainer, statistics tracker, and 27-lesson tutorial. Android and Windows share a platform-independent C# cube engine and local SQLite data store. The legacy TypeScript application remains temporarily under `apps/` and `packages/` as the behavioral reference until all parity gates pass.

## Prerequisites

Install the .NET 9 SDK and MAUI workload:

```bash
dotnet workload install maui
```

Android builds also require Android SDK 35, a JDK supported by .NET MAUI, and accepted Android SDK licenses. Windows builds require Windows 10/11, Visual Studio 2022 Build Tools with **.NET Multi-platform App UI development**, Windows App SDK tooling, and the Windows 10 SDK (10.0.19041 or newer).

## Build and test

```bash
dotnet restore CubeSolverPro.sln
dotnet build tests/CubeSolverPro.Core.Tests/CubeSolverPro.Core.Tests.csproj
dotnet test tests/CubeSolverPro.Core.Tests/CubeSolverPro.Core.Tests.csproj
dotnet build src/CubeSolverPro.App/CubeSolverPro.App.csproj -f net9.0-android
dotnet build src/CubeSolverPro.App/CubeSolverPro.App.csproj -f net9.0-windows10.0.19041.0
```

Run from Visual Studio by selecting an Android emulator/device or **Windows Machine**, or use `dotnet build -t:Run -f <target-framework>`.

## Data migration

The app stores sessions, solves, settings, and trainer progress in `cube-solver-pro.db3`. In **Settings**, select an existing React Cube Solver Pro JSON export (or a csTimer JSON export). Native import retains existing string identifiers, Unix-millisecond timestamps, notes, scrambles, and penalties. Imports commit in one SQLite transaction. Export creates the version 1 `cube-solver-pro-export` JSON format and opens the platform share/save UI; cancellation leaves data unchanged.

## Signing and publication

For Google Play, create an upload keystore, keep its secrets outside source control, and publish an Android App Bundle with `dotnet publish -f net9.0-android -c Release -p:AndroidPackageFormat=aab` plus the `AndroidSigning*` MSBuild properties. Test the signed AAB on an internal track before production.

For Microsoft Store, reserve the application identity in Partner Center, associate the project with that identity, replace the development publisher in `Package.appxmanifest`, and use a trusted certificate. Publish with Visual Studio's **Package and Publish** flow or `dotnet publish -f net9.0-windows10.0.19041.0 -c Release`. Validate the generated MSIX with the Windows App Certification Kit before submission.
