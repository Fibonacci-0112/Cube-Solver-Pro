namespace CubeSolverPro.Core.Tutorials;
public sealed record Lesson(string Id,string Title,string Section,bool Guided=false);
public static class LessonCatalog { public static IReadOnlyList<Lesson> All {get;} = Enumerable.Range(1,27).Select(i=>new Lesson($"lesson-{i}",i switch{1=>"Meet your cube",2=>"Move notation",26=>"Beginner guided solve",27=>"CFOP guided solve",_=>$"Speedcubing lesson {i}"},i<=8?"Basics":i<=20?"CFOP":"Improving",i>=26)).ToArray(); }
