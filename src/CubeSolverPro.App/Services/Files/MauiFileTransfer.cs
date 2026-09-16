using System.Text;
namespace CubeSolverPro.App.Services.Files;
public sealed class MauiFileTransfer:IFileTransfer {public async Task<string?> PickTextAsync(CancellationToken token=default){try{var file=await FilePicker.Default.PickAsync(new PickOptions{PickerTitle="Select Cube Solver Pro or csTimer backup"});if(file is null)return null;await using var stream=await file.OpenReadAsync();using var reader=new StreamReader(stream);return await reader.ReadToEndAsync(token);}catch(OperationCanceledException){return null;}}
 public async Task<bool> SaveAndShareAsync(string name,string content,CancellationToken token=default){try{var path=Path.Combine(FileSystem.CacheDirectory,name);await File.WriteAllTextAsync(path,content,Encoding.UTF8,token);await Share.Default.RequestAsync(new ShareFileRequest("Save or share backup",new ShareFile(path,"application/json")));return true;}catch(OperationCanceledException){return false;}}
}
