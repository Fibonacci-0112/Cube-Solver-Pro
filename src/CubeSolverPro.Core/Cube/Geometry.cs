namespace CubeSolverPro.Core.Cube;
public readonly record struct Vec(int X,int Y,int Z);
public static class Geometry {
 public static readonly Face[] Faces=Enum.GetValues<Face>(); public static int FaceIndex(Face f)=>(int)f; public static int Axis(Face f)=>f is Face.U or Face.D?0:f is Face.R or Face.L?1:2;
 static Vec Normal(Face f)=>f switch{Face.U=>new(0,1,0),Face.R=>new(1,0,0),Face.F=>new(0,0,1),Face.D=>new(0,-1,0),Face.L=>new(-1,0,0),_=>new(0,0,-1)};
 static Vec Row(Face f)=>f switch{Face.U=>new(0,0,1),Face.D=>new(0,0,-1),_=>new(0,-1,0)};
 static Vec Col(Face f)=>f switch{Face.U or Face.D or Face.F=>new(1,0,0),Face.R=>new(0,0,-1),Face.L=>new(0,0,1),_=>new(-1,0,0)};
 static int Dot(Vec a,Vec b)=>a.X*b.X+a.Y*b.Y+a.Z*b.Z; static int Tick(int n,int i)=>2*i-(n-1);
 public static Vec StickerPosition(int n,Face f,int row,int col){var nm=Normal(f);var rd=Row(f);var cd=Col(f);var r=Tick(n,row);var c=Tick(n,col);return new(n*nm.X+r*rd.X+c*cd.X,n*nm.Y+r*rd.Y+c*cd.Y,n*nm.Z+r*rd.Z+c*cd.Z);}
 public static int StickerIndex(int n,Vec p){foreach(var f in Faces){if(Dot(p,Normal(f))!=n)continue;var row=(Dot(p,Row(f))+n-1)/2;var col=(Dot(p,Col(f))+n-1)/2;return (int)f*n*n+row*n+col;}throw new ArgumentException("position is not on cube");}
 static Vec Rotate(Face f,Vec v)=>f switch{Face.U=>new(-v.Z,v.Y,v.X),Face.D=>new(v.Z,v.Y,-v.X),Face.R=>new(v.X,v.Z,-v.Y),Face.L=>new(v.X,-v.Z,v.Y),Face.F=>new(v.Y,-v.X,v.Z),_=>new(-v.Y,v.X,v.Z)};
 static int Depth(int n,int projection)=>projection==n?1:projection==-n?n:(n+1-projection)/2;
 public static int[] TurnPermutation(int n,Face face,int from,int to,int amount){var turns=((amount%4)+4)%4;var result=Enumerable.Range(0,6*n*n).ToArray();var normal=Normal(face);foreach(var f in Faces)for(var r=0;r<n;r++)for(var c=0;c<n;c++){var p=StickerPosition(n,f,r,c);var d=Depth(n,Dot(p,normal));if(d<from||d>to)continue;for(var t=0;t<turns;t++)p=Rotate(face,p);result[(int)f*n*n+r*n+c]=StickerIndex(n,p);}return result;}
}
