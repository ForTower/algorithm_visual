const lt = "<text decode='true'>&lt;</text>"
const text = `<pre>package algorithm.java_coding;

import java.util.ArrayList;
import java.util.List;

//邻接矩阵存储无向图
class Graph2 {
    private int[][] edges;
    private List${lt}Character> vertexs;
    private static final int INF = Integer.MAX_VALUE;
    private int[] path;
    private int[] dis;
    private boolean[] visited;

    //num: 图顶点的数量
    public Graph2(int num, List${lt}Character> vertexs) {
        this.edges = new int[num][num];
        this.vertexs = vertexs;
        //初始化邻接矩阵
        for (int i = 0; i ${lt} num; i++) {
            for (int j = 0; j ${lt} num; j++) {
                if (i == j) {
                    this.edges[i][j] = 0;
                } else {
                    this.edges[i][j] = INF;
                }
            }
        }
        path = new int[num];
        for (int i = 0; i ${lt} path.length; i++) {
            path[i] = i;
        }
        dis = new int[num];
        for (int i = 0; i ${lt} dis.length; i++) {
            dis[i] = INF;
        }
        visited = new boolean[num];
    }

    //添加无向边
    public void addEdge(int v1, int v2, int weight) {
        edges[v1][v2] = edges[v2][v1] = weight;
    }

    //删除无向边
    public void delEdge(int v1, int v2) {
        edges[v1][v2] = edges[v2][v1] = INF;
    }

    //获取v节点的第一个邻接节点
    private int getFirstVex(int v) {
        for (int j = 0; j ${lt} edges[0].length; j++) {
            if (edges[v][j] != 0 && edges[v][j] != INF) {
                return j;
            }
        }
        //该点与其他点不连通
        return -1;
    }

    //获取v1节点的下一个邻接节点
    private int getNextVex(int v1, int v2) {
        for (int j = v2 + 1; j ${lt} edges[0].length; j++) {
            if (edges[v1][j] != 0 && edges[v1][j] != INF) {
                return j;
            }
        }
        //该点不存在下一个邻接节点
        return -1;
    }

    //没有使用优先队列优化，时间复杂度为O(n的平方)
    public void dijkstra(int startVex) {
        //将startVex节点标记为已访问
        visited[startVex] = true;
        dis[startVex] = 0;
        //初始化从startVex节点到其相邻节点的距离
        //初始化路径数组
        for (int j = 0; j ${lt} dis.length; j++) {
            if (edges[startVex][j] != INF) {
                dis[j] = edges[startVex][j];
                //j的前驱节点是startVex节点
                path[j] = startVex;
            }
        }
        //采用广度优先遍历的方式更新dis数组和path数组
        for (int i = 0; i ${lt} vertexs.size() - 1; i++) {
            //选出这一轮中最低花费的节点
            int minCost = INF;
            //to是相对于startVex来说的
            int to = -1;
            for (int j = 0; j ${lt} dis.length; j++) {
                if (!visited[j] && minCost > dis[j]) {
                    minCost = dis[j];
                    to = j;
                }
            }
            //用于处理非连通图
            if (minCost == INF) {
                return;
            }
            //由以上可知这一轮from节点到各点的最低花费的节点为to节点
            //to节点设置为已经确定是最低花费的节点
            visited[to] = true;
            //找出to节点的邻接节点，并比较距离更新path和dis数组
            for (int w = getFirstVex(to); w != -1; w = getNextVex(to, w)) {
                //to节点到w节点的距离是INF(to节点和w节点非连通)或者w节点被访问过
                if (visited[w] || edges[to][w] == INF) {
                    continue;
                }
                //dis[w]为startVex节点到w节点的距离
                //dis[to]为startVex节点到to节点的距离（已经确定了是最少花费）
                //edges[to][w]位to节点到w节点的距离
                if (dis[w] > dis[to] + edges[to][w]) {
                    //更新startVex节点到w节点的距离
                    dis[w] = dis[to] + edges[to][w];
                    //此时w节点的前驱节点是to
                    path[w] = to;
                }
            }
        }
    }

    //打印startVex节点到各个节点的路径和距离
    public void printPathAndDis(int startVex) {
        //遍历每一个节点，递归一次寻找其前驱节点
        for (int i = 0; i ${lt} path.length; i++) {
            int pre = i;
            StringBuilder route = new StringBuilder();
            while (pre != startVex) {
                route.append(">-" + vertexs.get(pre));
                pre = path[pre];
            }
            route.append(">-" + vertexs.get(pre));
            route.reverse();
            route.delete(route.length() - 2, route.length());
            route.append(": " + dis[i]);
            //将路径信息和距离打印出来
            System.out.println(route.toString());
        }
    }

}

public class DijkstraCoding {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List${lt}Character> vertexs = new ArrayList${lt}>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph2 graph2 = new Graph2(vertexs.size(), vertexs);
        final int INF = Integer.MAX_VALUE;
        int[][] matrix = {
                //A  B  C  D  E  F  G
                /*A*/ {0, 31, INF, 9, 29, 4, INF},
                /*B*/ {31, 0, 28, INF, INF, 21, INF},
                /*C*/ {0, 28, 0, 14, INF, INF, 9},
                /*D*/ {9, INF, 14, 0, 10, INF, 4},
                /*E*/ {29, INF, INF, 10, 0, 29, 30},
                /*F*/ {4, 21, INF, INF, 29, 0, 10},
                /*G*/ {INF, INF, 9, 4, 30, 10, 0}
        };

        for (int i = 0; i ${lt} matrix.length; i++) {
            for (int j = i + 1; j ${lt} matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    graph2.addEdge(i, j, matrix[i][j]);
                }
            }
        }
        graph2.dijkstra(0);
        graph2.printPathAndDis(0);
        //打印结果
        /*
        A: 0
        A->F->B: 25
        A->D->G->C: 22
        A->D: 9
        A->D->E: 19
        A->F: 4
        A->D->G: 13
        */
        //完全正确
    }
}
</pre>
`

const coding = `package algorithm.java_coding;

import java.util.ArrayList;
import java.util.List;

//邻接矩阵存储无向图
class Graph2 {
    private int[][] edges;
    private List<Character> vertexs;
    private static final int INF = Integer.MAX_VALUE;
    private int[] path;
    private int[] dis;
    private boolean[] visited;

    //num: 图顶点的数量
    public Graph2(int num, List<Character> vertexs) {
        this.edges = new int[num][num];
        this.vertexs = vertexs;
        //初始化邻接矩阵
        for (int i = 0; i < num; i++) {
            for (int j = 0; j < num; j++) {
                if (i == j) {
                    this.edges[i][j] = 0;
                } else {
                    this.edges[i][j] = INF;
                }
            }
        }
        path = new int[num];
        for (int i = 0; i < path.length; i++) {
            path[i] = i;
        }
        dis = new int[num];
        for (int i = 0; i < dis.length; i++) {
            dis[i] = INF;
        }
        visited = new boolean[num];
    }

    //添加无向边
    public void addEdge(int v1, int v2, int weight) {
        //1表示两点连通
        edges[v1][v2] = edges[v2][v1] = weight;
    }

    //删除无向边
    public void delEdge(int v1, int v2) {
        //0表示两点不连通
        edges[v1][v2] = edges[v2][v1] = INF;
    }


    //获取v节点的第一个邻接节点
    private int getFirstVex(int v) {
        for (int j = 0; j < edges[0].length; j++) {
            if (edges[v][j] != 0 && edges[v][j] != INF) {
                return j;
            }
        }
        //该点与其他点不连通
        return -1;
    }

    //获取v1节点的下一个邻接节点
    private int getNextVex(int v1, int v2) {
        for (int j = v2 + 1; j < edges[0].length; j++) {
            if (edges[v1][j] != 0 && edges[v1][j] != INF) {
                return j;
            }
        }
        //该点不存在下一个邻接节点
        return -1;
    }

    //没有使用优先队列优化，时间复杂度为O(n的平方)
    public void dijkstra(int startVex) {
        //将startVex节点标记为已访问
        visited[startVex] = true;
        dis[startVex] = 0;
        //初始化从startVex节点到其相邻节点的距离
        //初始化路径数组
        for (int j = 0; j < dis.length; j++) {
            if (edges[startVex][j] != INF) {
                dis[j] = edges[startVex][j];
                //j的前驱节点是startVex节点
                path[j] = startVex;
            }
        }
        //采用广度优先遍历的方式更新dis数组和path数组
        for (int i = 0; i < vertexs.size() - 1; i++) {
            //选出这一轮中最低花费的节点
            int minCost = INF;
            //to是相对于startVex来说的
            int to = -1;
            for (int j = 0; j < dis.length; j++) {
                if (!visited[j] && minCost > dis[j]) {
                    minCost = dis[j];
                    to = j;
                }
            }
            //用于处理非连通图
            if (minCost == INF) {
                return;
            }
            //由以上可知这一轮from节点到各点的最低花费的节点为to节点
            //to节点设置为已经确定是最低花费的节点
            visited[to] = true;
            //找出to节点的邻接节点，并比较距离更新path和dis数组
            for (int w = getFirstVex(to); w != -1; w = getNextVex(to, w)) {
                //to节点到w节点的距离是INF(to节点和w节点非连通)或者w节点被访问过
                if (visited[w] || edges[to][w] == INF) {
                    continue;
                }
                //dis[w]为startVex节点到w节点的距离
                //dis[to]为startVex节点到to节点的距离（已经确定了是最少花费）
                //edges[to][w]位to节点到w节点的距离
                if (dis[w] > dis[to] + edges[to][w]) {
                    //更新startVex节点到w节点的距离
                    dis[w] = dis[to] + edges[to][w];
                    //此时w节点的前驱节点是to
                    path[w] = to;
                }
            }
        }
    }

    //打印startVex节点到各个节点的路径和距离
    public void printPathAndDis(int startVex) {
        //遍历每一个节点，递归一次寻找其前驱节点
        for (int i = 0; i < path.length; i++) {
            int pre = i;
            StringBuilder route = new StringBuilder();
            while (pre != startVex) {
                route.append(">-" + vertexs.get(pre));
                pre = path[pre];
            }
            route.append(">-" + vertexs.get(pre));
            route.reverse();
            route.delete(route.length() - 2, route.length());
            route.append(": " + dis[i]);
            //将路径信息和距离打印出来
            System.out.println(route.toString());
        }
    }

}

public class DijkstraCoding {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List<Character> vertexs = new ArrayList<>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph2 graph2 = new Graph2(vertexs.size(), vertexs);
        final int INF = Integer.MAX_VALUE;
        int[][] matrix = {
                //A  B  C  D  E  F  G
                /*A*/ {0, 31, INF, 9, 29, 4, INF},
                /*B*/ {31, 0, 28, INF, INF, 21, INF},
                /*C*/ {0, 28, 0, 14, INF, INF, 9},
                /*D*/ {9, INF, 14, 0, 10, INF, 4},
                /*E*/ {29, INF, INF, 10, 0, 29, 30},
                /*F*/ {4, 21, INF, INF, 29, 0, 10},
                /*G*/ {INF, INF, 9, 4, 30, 10, 0}
        };

        for (int i = 0; i < matrix.length; i++) {
            for (int j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    graph2.addEdge(i, j, matrix[i][j]);
                }
            }
        }
        graph2.dijkstra(0);
        graph2.printPathAndDis(0);
        //打印结果
        /*
        A: 0
        A->F->B: 25
        A->D->G->C: 22
        A->D: 9
        A->D->E: 19
        A->F: 4
        A->D->G: 13
        */
        //完全正确
    }
}
`

Page({
    data: {
        text
    },
    copy() {
        wx.setClipboardData({
            data: coding,
            success: function () {
                wx.showToast({
                    title: '复制成功',
                    icon: 'none',
                    duration: 500
                })
            }
        });
    },

})