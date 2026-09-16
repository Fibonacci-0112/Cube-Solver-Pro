using System.Text.RegularExpressions;
namespace CubeSolverPro.Core.Cube;
public enum Face { U, R, F, D, L, B }
public enum MoveSpanKind { Layers, Slice, Rotation }
public sealed record MoveSpan(MoveSpanKind Kind, int From=1, int To=1);
public sealed record Move(Face Face, MoveSpan Span, int Amount);
public static partial class Notation {
 [GeneratedRegex(@"^(\d*)([URFDLBurfdlbMESxyz])(w?)('?)(2?)('?)$")] private static partial Regex Token();
 public static Move? ParseMove(string token) { var m=Token().Match(token); if(!m.Success||m.Groups[4].Length>0&&m.Groups[6].Length>0)return null; var letter=m.Groups[2].Value[0]; var amount=m.Groups[5].Length>0?2:1; if(m.Groups[4].Length>0||m.Groups[6].Length>0)amount=4-amount;
  if("xyz".Contains(letter)){if(m.Groups[1].Length>0||m.Groups[3].Length>0)return null; return new(letter=='x'?Face.R:letter=='y'?Face.U:Face.F,new(MoveSpanKind.Rotation),amount);}
  if("MES".Contains(letter)){if(m.Groups[1].Length>0||m.Groups[3].Length>0)return null; return new(letter=='M'?Face.L:letter=='E'?Face.D:Face.F,new(MoveSpanKind.Slice),amount);}
  var face=Enum.Parse<Face>(char.ToUpperInvariant(letter).ToString()); var wide=char.IsLower(letter)||m.Groups[3].Length>0; if(!wide&&m.Groups[1].Length>0)return null; var depth=wide?(m.Groups[1].Length>0?int.Parse(m.Groups[1].Value):2):1; return depth<1?null:new(face,new(MoveSpanKind.Layers,1,depth),amount); }
 public static IReadOnlyList<Move> ParseAlg(string text)=>text.Split((char[]?)null,StringSplitOptions.RemoveEmptyEntries).Select(t=>ParseMove(t)??throw new FormatException($"unrecognised move \"{t}\" in \"{text}\"")).ToArray();
 public static string FormatMove(Move m){var suffix=m.Amount==1?"":m.Amount==2?"2":"'"; if(m.Span.Kind==MoveSpanKind.Rotation)return (m.Face==Face.R?"x":m.Face==Face.U?"y":"z")+suffix;if(m.Span.Kind==MoveSpanKind.Slice)return(m.Face==Face.L?"M":m.Face==Face.D?"E":"S")+suffix;return(m.Span.To==1?m.Face.ToString():m.Span.To==2?$"{m.Face}w":$"{m.Span.To}{m.Face}w")+suffix;}
 public static string FormatAlg(IEnumerable<Move> moves)=>string.Join(' ',moves.Select(FormatMove));
 public static Move InvertMove(Move m)=>m with{Amount=4-m.Amount}; public static IReadOnlyList<Move> InvertAlg(IEnumerable<Move> moves)=>moves.Reverse().Select(InvertMove).ToArray();
 public static (int From,int To) ResolveSpan(MoveSpan s,int n)=>s.Kind switch{MoveSpanKind.Layers=>(s.From,Math.Min(s.To,n)),MoveSpanKind.Slice=>(2,Math.Max(2,n-1)),_=>(1,n)};
}
