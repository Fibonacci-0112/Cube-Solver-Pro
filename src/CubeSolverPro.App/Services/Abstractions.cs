using CubeSolverPro.Core.Data; using CubeSolverPro.Core.Statistics;
namespace CubeSolverPro.App.Services;
public interface IAppStore {Task InitializeAsync();Task<IReadOnlyList<Session>> GetSessionsAsync();Task<IReadOnlyList<Solve>> GetSolvesAsync(string sessionId);Task SaveSessionAsync(Session value);Task SaveSolveAsync(Solve value);Task DeleteSolveAsync(string id);Task<Settings> GetSettingsAsync();Task SaveSettingsAsync(Settings value);Task ImportAsync(ImportResult value);Task<ExportFile> ExportAsync();}
public interface IFileTransfer {Task<string?> PickTextAsync(CancellationToken token=default);Task<bool> SaveAndShareAsync(string name,string content,CancellationToken token=default);}
public interface IAppInfo {string Name{get;}string Version{get;}string Platform{get;}}
public sealed class AppInfoService:IAppInfo {public string Name=>Microsoft.Maui.ApplicationModel.AppInfo.Current.Name;public string Version=>Microsoft.Maui.ApplicationModel.AppInfo.Current.VersionString;public string Platform=>DeviceInfo.Platform.ToString();}
public sealed class AppState(IAppStore store)
{
    public bool Ready { get; private set; }
    public Settings Settings { get; private set; } = new();
    public IReadOnlyList<Session> Sessions { get; private set; } = [];
    public IReadOnlyList<Solve> Solves { get; private set; } = [];
    public string? CurrentSessionId { get; private set; }
    public string CurrentPuzzle => Settings.CurrentPuzzle;
    public event Action? Changed;

    public async Task InitializeAsync()
    {
        if (Ready) return;
        await store.InitializeAsync();
        Settings = await store.GetSettingsAsync();
        Sessions = await store.GetSessionsAsync();
        if (Sessions.Count == 0)
        {
            await store.SaveSessionAsync(new Session(Transfer.NewId("session"), "Main", CurrentPuzzle, Now()));
            Sessions = await store.GetSessionsAsync();
        }

        var current = Sessions.FirstOrDefault(x => x.Id == Settings.CurrentSessionId && x.Puzzle == CurrentPuzzle)
            ?? Sessions.LastOrDefault(x => x.Puzzle == CurrentPuzzle)
            ?? Sessions[0];
        CurrentSessionId = current.Id;
        if (Settings.CurrentPuzzle != current.Puzzle || Settings.CurrentSessionId != current.Id)
        {
            Settings = Settings with { CurrentPuzzle = current.Puzzle, CurrentSessionId = current.Id };
            await store.SaveSettingsAsync(Settings);
        }
        Solves = await store.GetSolvesAsync(current.Id);
        Ready = true;
        Notify();
    }

    public IEnumerable<Session> PuzzleSessions => Sessions.Where(x => x.Puzzle == CurrentPuzzle);

    public async Task SetPuzzleAsync(string puzzle)
    {
        var session = Sessions.LastOrDefault(x => x.Puzzle == puzzle);
        if (session is null)
        {
            session = new Session(Transfer.NewId("session"), "Main", puzzle, Now());
            await store.SaveSessionAsync(session);
            Sessions = await store.GetSessionsAsync();
        }
        Settings = Settings with { CurrentPuzzle = puzzle, CurrentSessionId = session.Id };
        await store.SaveSettingsAsync(Settings);
        CurrentSessionId = session.Id;
        Solves = await store.GetSolvesAsync(session.Id);
        Notify();
    }

    public async Task SelectSessionAsync(string id)
    {
        var session = Sessions.FirstOrDefault(x => x.Id == id);
        if (session is null) return;
        CurrentSessionId = id;
        Settings = Settings with { CurrentPuzzle = session.Puzzle, CurrentSessionId = id };
        await store.SaveSettingsAsync(Settings);
        Solves = await store.GetSolvesAsync(id);
        Notify();
    }

    public async Task CreateSessionAsync(string name)
    {
        var session = new Session(Transfer.NewId("session"), name.Trim(), CurrentPuzzle, Now());
        await store.SaveSessionAsync(session);
        Sessions = await store.GetSessionsAsync();
        await SelectSessionAsync(session.Id);
    }

    public async Task AddSolveAsync(string scramble, long timeMs, Penalty penalty = Penalty.None)
    {
        if (CurrentSessionId is null) return;
        var solve = new Solve(Transfer.NewId("solve"), CurrentSessionId, CurrentPuzzle, scramble, timeMs, penalty, Now());
        await store.SaveSolveAsync(solve);
        Solves = [.. Solves, solve];
        Notify();
    }

    public async Task SetPenaltyAsync(Solve solve, Penalty penalty)
    {
        await store.SaveSolveAsync(solve with { Penalty = penalty });
        Solves = Solves.Select(x => x.Id == solve.Id ? x with { Penalty = penalty } : x).ToArray();
        Notify();
    }

    public async Task DeleteSolveAsync(string id)
    {
        await store.DeleteSolveAsync(id);
        Solves = Solves.Where(x => x.Id != id).ToArray();
        Notify();
    }

    public async Task SaveSettingsAsync(Settings settings)
    {
        Settings = settings;
        await store.SaveSettingsAsync(settings);
        Notify();
    }

    public async Task ReloadAsync()
    {
        Ready = false;
        Sessions = await store.GetSessionsAsync();
        Settings = await store.GetSettingsAsync();
        CurrentSessionId = Settings.CurrentSessionId;
        Solves = CurrentSessionId is null ? [] : await store.GetSolvesAsync(CurrentSessionId);
        Ready = true;
        Notify();
    }

    public void Notify() => Changed?.Invoke();
    static long Now() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}
public sealed class ThemeService {public AppTheme Current=>Application.Current?.RequestedTheme??AppTheme.Unspecified;public event Action? Changed;public ThemeService(){if(Application.Current is not null)Application.Current.RequestedThemeChanged+=(_,_)=>Changed?.Invoke();}}
