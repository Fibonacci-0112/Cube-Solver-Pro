using CubeSolverPro.Core.Data; using CubeSolverPro.Core.Statistics;
namespace CubeSolverPro.App.Services;
public interface IAppStore {Task InitializeAsync();Task<IReadOnlyList<Session>> GetSessionsAsync();Task<IReadOnlyList<Solve>> GetSolvesAsync(string sessionId);Task SaveSessionAsync(Session value);Task SaveSolveAsync(Solve value);Task DeleteSolveAsync(string id);Task<Settings> GetSettingsAsync();Task SaveSettingsAsync(Settings value);Task ImportAsync(ImportResult value);Task<ExportFile> ExportAsync();}
public interface IFileTransfer {Task<string?> PickTextAsync(CancellationToken token=default);Task<bool> SaveAndShareAsync(string name,string content,CancellationToken token=default);}
public interface IAppInfo {string Name{get;}string Version{get;}string Platform{get;}}
public sealed class AppInfoService:IAppInfo {public string Name=>Microsoft.Maui.ApplicationModel.AppInfo.Current.Name;public string Version=>Microsoft.Maui.ApplicationModel.AppInfo.Current.VersionString;public string Platform=>DeviceInfo.Platform.ToString();}
public sealed class AppState {public string CurrentPuzzle{get;set;}="333";public event Action? Changed;public void Notify()=>Changed?.Invoke();}
public sealed class ThemeService {public AppTheme Current=>Application.Current?.RequestedTheme??AppTheme.Unspecified;public event Action? Changed;public ThemeService(){if(Application.Current is not null)Application.Current.RequestedThemeChanged+=(_,_)=>Changed?.Invoke();}}
