const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package algorithm.java_coding;

import java.util.*;

class Edge implements Comparable${lt}Edge> {
    public int from;
    public int to;
    public int weight;

    public Edge(int from, int to, int weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }

    //按边的权值由小到大排序
    @Override
    public int compareTo(Edge edge) {
        return this.weight - edge.weight;
    }
}

//邻接矩阵存储无向图
class Graph3 {
    private int[][] edges;
    private List${lt}Character> vertexs;
    private static final int INF = Integer.MAX_VALUE;
    private int[] path;
    private int[] dis;
    private boolean[] visited;

    //num: 图顶点的数量
    public Graph3(int num, List${lt}Character> vertexs) {
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

    //prim算法求最小生成树的最小花费
    public int prim(int startVex) {
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
            //选择的节点
            int select = -1;
            for (int j = 0; j ${lt} dis.length; j++) {
                if (!visited[j] && minCost > dis[j]) {
                    minCost = dis[j];
                    select = j;
                }
            }
            //用于处理非连通图
            if (minCost == INF) {
                return -1;
            }
            //由以上可知这一轮path[select]节点到各点的最低花费的节点为select节点
            //select节点设置为已经确定是最低花费的节点
            // 打印路径和距离
            System.out.println(vertexs.get(path[select]) + "->" + vertexs.get(select) + ": " + dis[select]);
            visited[select] = true;
            //找出select节点的邻接节点，并比较距离更新path和dis数组
            for (int w = getFirstVex(select); w != -1; w = getNextVex(select, w)) {
                //select节点到w节点的距离是INF(select节点和w节点非连通)或者w节点被访问过
                if (visited[w] || edges[select][w] == INF) {
                    continue;
                }
                //dis[w]为path[select]节点到w节点的距离
                //唯一和迪杰斯特拉算法不一样的就是这个条件
                if (dis[w] > edges[select][w]) {
                    //更新距离
                    dis[w] = edges[select][w];
                    //此时w节点的前驱节点是select
                    path[w] = select;
                }
            }
        }
        //计算出总的最小花费
        int totalMinCost = 0;
        for (int i = 0; i ${lt} dis.length; i++) {
            totalMinCost += dis[i];
        }
        return totalMinCost;
    }

    //kruskal算法求最小生成树的最小花费
    //对于连通图，生成最小生成树的边数一定是vertexs.size()-1
    //我们可以利用这一点进行小小的优化
    //采用并查集优化和利用最小生成树的边数一定是vertexs.size()-1进行优化
    public int kruskal(List${lt}Edge> edges) {
        //判断图是否连通
        if (!isConnected()) {
            return -1;
        }
        //寻找根节点数组
        int[] route = new int[vertexs.size()];
        for (int i = 0; i ${lt} route.length; i++) {
            route[i] = i;
        }
        int totalMinCost = 0;
        int numOfEdge = 0;
        //对边的权值进行由小到大排序
        Collections.sort(edges);
        //遍历edges
        for (int i = 0; i ${lt} edges.size() && numOfEdge ${lt} vertexs.size(); i++) {
            Edge edge = edges.get(i);
            //from节点的根节点
            //没有采用并查集按路径压缩进行优化
            //int fromOfRoot = find(route, edge.from);
            //int toOfRoot = find(route, edge.to);

            //采用并查集按路径压缩进行优化
            int fromOfRoot = find2(route, edge.from);
            int toOfRoot = find2(route, edge.to);
            //判断添加该边是否导致形成环路
            if (fromOfRoot != toOfRoot) {
                //添加该边不会形成环
                //打印该边以表示该边符合条件
                System.out.println(vertexs.get(edge.from) + "->" + vertexs.get(edge.to) + ": " + edge.weight);
                totalMinCost += edge.weight;
                //标识edge.from与edge.to连通
                route[fromOfRoot] = toOfRoot;
                //边的数量增加1
                numOfEdge++;
            }
        }
        return totalMinCost;
    }

    //没有采用并查集按路径压缩进行优化
    private int find(int[] route, int v) {
        while (v != route[v]) {
            v = route[v];
        }
        return v;
    }

    //并查集按路径压缩进行优化
    private int find2(int[] route, int v) {
//        if (v == route[v]) {
//            return v;
//        }
//        return route[v] = find2(route, route[v]);
        //把以上代码写成一句话
        return v == route[v] ? v : (route[v] = find2(route, route[v]));
    }

    //判断无向图是否连通
    //通过广度优先遍历的方式遍历图
    //遍历过程中每访问一个节点，numOfVex++;
    //numOfVex与vertexs.size()比较，如果numOfVex == vertexs.size(),则连通
    //如果numOfVex ${lt} vertexs.size(),则非连通
    public boolean isConnected() {
        boolean[] visited = new boolean[vertexs.size()];
        int numOfVex = 0;
        Deque${lt}Integer> queue = new ArrayDeque${lt}>();
        queue.push(0);
        visited[0] = true;
        while (!queue.isEmpty()) {
            int cur = queue.pollLast();
            numOfVex++;
            int w = getFirstVex(cur);
            while (w != -1) {
                if (!visited[w]) {
                    queue.push(w);
                    visited[w] = true;
                }
                w = getNextVex(cur, w);
            }
        }
        return numOfVex == vertexs.size();
    }
}

public class MSTCoding {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List${lt}Character> vertexs = new ArrayList${lt}>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph3 graph3 = new Graph3(vertexs.size(), vertexs);
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

        //测试prim算法
//        for (int i = 0; i ${lt} matrix.length; i++) {
//            for (int j = i + 1; j ${lt} matrix[i].length; j++) {
//                if (matrix[i][j] != INF) {
//                    graph3.addEdge(i, j, matrix[i][j]);
//                }
//            }
//        }
//        int res = graph3.prim(0);
//        System.out.println("最小生成树的最低花费为：" + res);
        //打印结果
        /*
        A->F: 4
        A->D: 9
        D->G: 4
        G->C: 9
        D->E: 10
        F->B: 21
        最小生成树的最低花费为：57
        */
        //完全正确

        //测试kruskal算法
        List${lt}Edge> edges = new ArrayList${lt}>();
        for (int i = 0; i ${lt} matrix.length; i++) {
            for (int j = i + 1; j ${lt} matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    edges.add(new Edge(i, j, matrix[i][j]));
                }
            }
        }
        //kruskal算法检测图是否连通时用到
        for (int i = 0; i ${lt} matrix.length; i++) {
            for (int j = i + 1; j ${lt} matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    graph3.addEdge(i, j, matrix[i][j]);
                }
            }
        }
        int res = graph3.kruskal(edges);
        System.out.println("最小生成树的最低花费为：" + res);
        //输出结果
        /*
        A->F: 4
        D->G: 4
        A->D: 9
        C->G: 9
        D->E: 10
        B->F: 21
        最小生成树的最低花费为：57
         */
        //结果分析：和prim算法得出的结果是一样的
    }
}
</pre>
`
const coding = `package algorithm.java_coding;

import java.util.*;

class Edge implements Comparable<Edge> {
    public int from;
    public int to;
    public int weight;

    public Edge(int from, int to, int weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }

    //按边的权值由小到大排序
    @Override
    public int compareTo(Edge edge) {
        return this.weight - edge.weight;
    }
}

//邻接矩阵存储无向图
class Graph3 {
    private int[][] edges;
    private List<Character> vertexs;
    private static final int INF = Integer.MAX_VALUE;
    private int[] path;
    private int[] dis;
    private boolean[] visited;

    //num: 图顶点的数量
    public Graph3(int num, List<Character> vertexs) {
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
        edges[v1][v2] = edges[v2][v1] = weight;
    }

    //删除无向边
    public void delEdge(int v1, int v2) {
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

    //prim算法求最小生成树的最小花费
    public int prim(int startVex) {
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
            //选择的节点
            int select = -1;
            for (int j = 0; j < dis.length; j++) {
                if (!visited[j] && minCost > dis[j]) {
                    minCost = dis[j];
                    select = j;
                }
            }
            //用于处理非连通图
            if (minCost == INF) {
                return -1;
            }
            //由以上可知这一轮path[select]节点到各点的最低花费的节点为select节点
            //select节点设置为已经确定是最低花费的节点
            // 打印路径和距离
            System.out.println(vertexs.get(path[select]) + "->" + vertexs.get(select) + ": " + dis[select]);
            visited[select] = true;
            //找出select节点的邻接节点，并比较距离更新path和dis数组
            for (int w = getFirstVex(select); w != -1; w = getNextVex(select, w)) {
                //select节点到w节点的距离是INF(select节点和w节点非连通)或者w节点被访问过
                if (visited[w] || edges[select][w] == INF) {
                    continue;
                }
                //dis[w]为path[select]节点到w节点的距离
                //唯一和迪杰斯特拉算法不一样的就是这个条件
                if (dis[w] > edges[select][w]) {
                    //更新距离
                    dis[w] = edges[select][w];
                    //此时w节点的前驱节点是select
                    path[w] = select;
                }
            }
        }
        //计算出总的最小花费
        int totalMinCost = 0;
        for (int i = 0; i < dis.length; i++) {
            totalMinCost += dis[i];
        }
        return totalMinCost;
    }

    //kruskal算法求最小生成树的最小花费
    //对于连通图，生成最小生成树的边数一定是vertexs.size()-1
    //我们可以利用这一点进行小小的优化
    //采用并查集优化和利用最小生成树的边数一定是vertexs.size()-1进行优化
    public int kruskal(List<Edge> edges) {
        //判断图是否连通
        if (!isConnected()) {
            return -1;
        }
        //寻找根节点数组
        int[] route = new int[vertexs.size()];
        for (int i = 0; i < route.length; i++) {
            route[i] = i;
        }
        int totalMinCost = 0;
        int numOfEdge = 0;
        //对边的权值进行由小到大排序
        Collections.sort(edges);
        //遍历edges
        for (int i = 0; i < edges.size() && numOfEdge < vertexs.size(); i++) {
            Edge edge = edges.get(i);
            //from节点的根节点
            //没有采用并查集按路径压缩进行优化
            //int fromOfRoot = find(route, edge.from);
            //int toOfRoot = find(route, edge.to);

            //采用并查集按路径压缩进行优化
            int fromOfRoot = find2(route, edge.from);
            int toOfRoot = find2(route, edge.to);
            //判断添加该边是否导致形成环路
            if (fromOfRoot != toOfRoot) {
                //添加该边不会形成环
                //打印该边以表示该边符合条件
                System.out.println(vertexs.get(edge.from) + "->" + vertexs.get(edge.to) + ": " + edge.weight);
                totalMinCost += edge.weight;
                //标识edge.from与edge.to连通
                route[fromOfRoot] = toOfRoot;
                //边的数量增加1
                numOfEdge++;
            }
        }
        return totalMinCost;
    }

    //没有采用并查集按路径压缩进行优化
    private int find(int[] route, int v) {
        while (v != route[v]) {
            v = route[v];
        }
        return v;
    }

    //并查集按路径压缩进行优化
    private int find2(int[] route, int v) {
//        if (v == route[v]) {
//            return v;
//        }
//        return route[v] = find2(route, route[v]);
        //把以上代码写成一句话
        return v == route[v] ? v : (route[v] = find2(route, route[v]));
    }

    //判断无向图是否连通
    //通过广度优先遍历的方式遍历图
    //遍历过程中每访问一个节点，numOfVex++;
    //numOfVex与vertexs.size()比较，如果numOfVex == vertexs.size(),则连通
    //如果numOfVex < vertexs.size(),则非连通
    public boolean isConnected() {
        boolean[] visited = new boolean[vertexs.size()];
        int numOfVex = 0;
        Deque<Integer> queue = new ArrayDeque<>();
        queue.push(0);
        visited[0] = true;
        while (!queue.isEmpty()) {
            int cur = queue.pollLast();
            numOfVex++;
            int w = getFirstVex(cur);
            while (w != -1) {
                if (!visited[w]) {
                    queue.push(w);
                    visited[w] = true;
                }
                w = getNextVex(cur, w);
            }
        }
        return numOfVex == vertexs.size();
    }
}

public class MSTCoding {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List<Character> vertexs = new ArrayList<>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph3 graph3 = new Graph3(vertexs.size(), vertexs);
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

        //测试prim算法
//        for (int i = 0; i < matrix.length; i++) {
//            for (int j = i + 1; j < matrix[i].length; j++) {
//                if (matrix[i][j] != INF) {
//                    graph3.addEdge(i, j, matrix[i][j]);
//                }
//            }
//        }
//        int res = graph3.prim(0);
//        System.out.println("最小生成树的最低花费为：" + res);
        //打印结果
        /*
        A->F: 4
        A->D: 9
        D->G: 4
        G->C: 9
        D->E: 10
        F->B: 21
        最小生成树的最低花费为：57
        */
        //完全正确

        //测试kruskal算法
        List<Edge> edges = new ArrayList<>();
        for (int i = 0; i < matrix.length; i++) {
            for (int j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    edges.add(new Edge(i, j, matrix[i][j]));
                }
            }
        }
        //kruskal算法检测图是否连通时用到
        for (int i = 0; i < matrix.length; i++) {
            for (int j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] != INF) {
                    graph3.addEdge(i, j, matrix[i][j]);
                }
            }
        }
        int res = graph3.kruskal(edges);
        System.out.println("最小生成树的最低花费为：" + res);
        //输出结果
        /*
        A->F: 4
        D->G: 4
        A->D: 9
        C->G: 9
        D->E: 10
        B->F: 21
        最小生成树的最低花费为：57
         */
        //结果分析：和prim算法得出的结果是一样的
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