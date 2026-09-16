using Xunit;
using CubeSolverPro.Core.Cube;using CubeSolverPro.Core.Data;using CubeSolverPro.Core.Statistics;using CubeSolverPro.Core.Tutorials;
namespace CubeSolverPro.Core.Tests;
public class CoreParityTests {
 [Theory][InlineData("R U R' U'",3)][InlineData("3Rw U2 3Rw'",5)][InlineData("x y z M E S",3)]public void AlgorithmRoundTrip(string alg,int size){var moves=Notation.ParseAlg(alg);Assert.Equal(alg,Notation.FormatAlg(moves));var cube=PuzzleCube.Solved(size).ApplyAlg(alg);foreach(var m in Notation.InvertAlg(moves))cube.Apply(m);Assert.True(cube.IsSolved());}
 [Fact]public void GeometryCoordinatesRoundTrip(){for(var n=2;n<=7;n++)foreach(var f in Geometry.Faces)for(var r=0;r<n;r++)for(var c=0;c<n;c++){var expected=(int)f*n*n+r*n+c;Assert.Equal(expected,Geometry.StickerIndex(n,Geometry.StickerPosition(n,f,r,c)));}}
 [Fact]public void ScramblesHaveRequiredBounds(){foreach(var (id,p) in Scrambles.Puzzles.Where(x=>x.Value.MoveCount.HasValue)){var moves=Scrambles.RandomMoveScramble(p.Size,p.MoveCount!.Value,new Random(1));Assert.Equal(p.MoveCount,moves.Count);for(var i=1;i<moves.Count;i++)Assert.NotEqual(moves[i-1].Face,moves[i].Face);}}
 [Fact]public void WcaAverageDropsBestAndWorst(){var solves=Enumerable.Range(1,5).Select(i=>new Solve($"s{i}","x","333","",i*1000,Penalty.None,i)).ToArray();Assert.Equal(3000,SolveStatistics.Average(solves,5,out var dnf));Assert.False(dnf);}
 [Fact]public void MoreDnfsThanTrimInvalidatesAverage(){var solves=Enumerable.Range(1,5).Select(i=>new Solve($"s{i}","x","333","",i*1000,i<3?Penalty.Dnf:Penalty.None,i)).ToArray();Assert.Null(SolveStatistics.Average(solves,5,out var dnf));Assert.True(dnf);}
 [Fact]public void NativeBackupPreservesFields(){var session=new Session("session-old","Main","333",1700000000123);var solve=new Solve("solve-old",session.Id,"333","R U",12345,Penalty.Plus2,1700000000456,"note");var parsed=Transfer.ParseImport(Transfer.Serialize(Transfer.BuildExport([session],[solve],[],new Settings{ZenMode=true})));Assert.Equal("cube-solver-pro",parsed.Source);Assert.Equal(solve,Assert.Single(parsed.Solves));Assert.True(parsed.Settings!.ZenMode);}
 [Fact]public void CsTimerSecondsBecomeUnixMilliseconds(){var parsed=Transfer.ParseImport("{\"session1\":[[[2000,1234],\"R U\",\"note\",1700000000]]}");var solve=Assert.Single(parsed.Solves);Assert.Equal(1700000000000,solve.CreatedAt);Assert.Equal(Penalty.Plus2,solve.Penalty);}
 [Fact]public void AllLessonsWereMoved(){Assert.Equal(27,LessonCatalog.All.Count);Assert.Equal(2,LessonCatalog.All.Count(x=>x.Guided));}
}
