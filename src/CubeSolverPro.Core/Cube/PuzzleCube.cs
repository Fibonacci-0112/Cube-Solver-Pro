namespace CubeSolverPro.Core.Cube;
public sealed class PuzzleCube {
 public int Size {get;} public byte[] Stickers {get;}
 PuzzleCube(int n,byte[] stickers){Size=n;Stickers=stickers;}
 public static PuzzleCube Solved(int n){if(n<2)throw new ArgumentOutOfRangeException(nameof(n));return new(n,Enumerable.Range(0,6*n*n).Select(i=>(byte)(i/(n*n))).ToArray());}
 public static PuzzleCube FromFacelets(string value){var n=(int)Math.Round(Math.Sqrt(value.Length/6d));if(6*n*n!=value.Length)throw new FormatException("facelet string is not a cube");return new(n,value.Select(c=>(byte)Array.IndexOf(Geometry.Faces,Enum.TryParse<Face>(char.ToUpperInvariant(c).ToString(),out var f)?f:(Face)(-1))).Select(x=>x<=5?x:throw new FormatException("unknown facelet")).ToArray());}
 public PuzzleCube Clone()=>new(Size,[..Stickers]); public PuzzleCube Apply(Move move){var (from,to)=Notation.ResolveSpan(move.Span,Size);var perm=Geometry.TurnPermutation(Size,move.Face,from,to,move.Amount);var before=(byte[])Stickers.Clone();for(var i=0;i<perm.Length;i++)Stickers[perm[i]]=before[i];return this;} public PuzzleCube ApplyAlg(string alg){foreach(var move in Notation.ParseAlg(alg))Apply(move);return this;}
 public bool IsSolved()=>Stickers.Select((x,i)=>x==i/(Size*Size)).All(x=>x); public bool IsSolvedIgnoringOrientation()=>Enumerable.Range(0,6).All(f=>Enumerable.Range(1,Size*Size-1).All(i=>Stickers[f*Size*Size+i]==Stickers[f*Size*Size])); public string Facelets()=>new(Stickers.Select(x=>Geometry.Faces[x].ToString()[0]).ToArray());
 public IReadOnlyList<IReadOnlyList<int>> FaceGrid(Face f)=>Enumerable.Range(0,Size).Select(r=>(IReadOnlyList<int>)Enumerable.Range(0,Size).Select(c=>(int)Stickers[(int)f*Size*Size+r*Size+c]).ToArray()).ToArray(); public bool Equals(PuzzleCube? other)=>other is not null&&Size==other.Size&&Stickers.SequenceEqual(other.Stickers);
}
