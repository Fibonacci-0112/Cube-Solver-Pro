using CubeSolverPro.App.Services; using CubeSolverPro.App.Services.Files; using CubeSolverPro.App.Services.Storage;
namespace CubeSolverPro.App; public static class MauiProgram {public static MauiApp CreateMauiApp(){var b=MauiApp.CreateBuilder().UseMauiApp<App>();b.Services.AddMauiBlazorWebView();b.Services.AddSingleton<IAppStore,SqliteAppStore>();b.Services.AddSingleton<IFileTransfer,MauiFileTransfer>();b.Services.AddSingleton<IAppInfo,AppInfoService>();b.Services.AddScoped<AppState>();b.Services.AddSingleton<ThemeService>();#if DEBUG
b.Services.AddBlazorWebViewDeveloperTools();
#endif
return b.Build();}}
