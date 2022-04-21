const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package algorithm.java_coding;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

//邻接矩阵存储无向图
class Graph {
    private int[][] edges;
    private List${lt}Character> vertexs;

    //num 图顶点的数量
    public Graph(int num, List${lt}Character> vertexs) {
        this.edges = new int[num][num];
        this.vertexs = vertexs;
        //初始化邻接矩阵
        for (int i = 0; i ${lt} num; i++) {
            for (int j = 0; j ${lt} num; j++) {
                this.edges[i][j] = 0;
            }
        }
    }

    //添加无向边
    public void addEdge(int v1, int v2) {
        //1表示两点连通
        edges[v1][v2] = edges[v2][v1] = 1;
    }

    //删除无向边
    public void delEdge(int v1, int v2) {
        //0表示两点不连通
        edges[v1][v2] = edges[v2][v1] = 0;
    }

    //广度优先遍历
    /*
    主要思想：
    1、首先以一个未被访问过的顶点作为起始顶点，访问其所有相邻的顶点；
    2、然后对每个相邻的顶点，再访问它们相邻的未被访问过的顶点；
    3、直到所有顶点都被访问过，遍历结束。
     */
    public void bfs(int startVex) {
        //访问数组，访问过的节点标注为true,未访问过的节点标注为false
        boolean[] visited = new boolean[edges[0].length];
        //申请一个队列
        Deque${lt}Integer> queue = new ArrayDeque${lt}>();
        queue.push(startVex);
        visited[startVex] = true;
        while (!queue.isEmpty()) {
            int cur = queue.pollLast();
            System.out.println(vertexs.get(cur));
            //cur节点的第一个邻接节点
            int w = getFirstVex(cur);
            while (w != -1) {
                //w节点没有被访问过，则入队列
                if (!visited[w]) {
                    queue.push(w);
                    //将w节点标记为已访问状态
                    visited[w] = true;
                }
                //cur节点的下一个邻接节点
                w = getNextVex(cur, w);
            }
        }
    }

    //深度优先遍历
    public void dfs(int cur, boolean[] visited) {
        //访问cur节点
        System.out.println(vertexs.get(cur));
        //将cur节点标记为已访问状态
        visited[cur] = true;
        //cur节点的第一个邻接节点
        int w = getFirstVex(cur);
        while (w != -1) {
            //w没有被访问过
            if (!visited[w]) {
                dfs(w, visited);
            }
            //cur节点的下一个邻接节点
            w = getNextVex(cur, w);
        }
    }

    //获取v节点的第一个邻接节点
    private int getFirstVex(int v) {
        for (int j = 0; j ${lt} edges[0].length; j++) {
            if (edges[v][j] != 0) {
                return j;
            }
        }
        //该点与其他点不连通
        return -1;
    }

    //获取v1节点的下一个邻接节点
    private int getNextVex(int v1, int v2) {
        for (int j = v2 + 1; j ${lt} edges[0].length; j++) {
            if (edges[v1][j] != 0) {
                return j;
            }
        }
        //该点不存在下一个邻接节点
        return -1;
    }

}

public class GraphTraverse {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List${lt}Character> vertexs = new ArrayList${lt}>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph graph = new Graph(vertexs.size(), vertexs);

        int[][] matrix = {
                //A  B  C  D  E  F  G
                /*A*/ {0, 1, 0, 1, 1, 1, 0},
                /*B*/ {1, 0, 1, 0, 0, 1, 0},
                /*C*/ {0, 1, 0, 1, 0, 0, 1},
                /*D*/ {1, 0, 1, 0, 1, 0, 1},
                /*E*/ {1, 0, 0, 1, 0, 1, 1},
                /*F*/ {1, 1, 0, 0, 1, 0, 1},
                /*G*/ {0, 0, 1, 1, 1, 1, 0}
        };

        for (int i = 0; i ${lt} matrix.length; i++) {
            for (int j = i + 1; j ${lt} matrix[i].length; j++) {
                if (matrix[i][j] == 1) {
                    graph.addEdge(i, j);
                }
            }
        }
        //graph.bfs(0);
        boolean[] visited = new boolean[vertexs.size()];
        graph.dfs(0, visited);
    }
}
</pre>
`

const coding = `package algorithm.java_coding;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

//邻接矩阵存储无向图
class Graph {
    private int[][] edges;
    private List<Character> vertexs;

    //num: 图顶点的数量
    public Graph(int num, List<Character> vertexs) {
        this.edges = new int[num][num];
        this.vertexs = vertexs;
        //初始化邻接矩阵
        for (int i = 0; i < num; i++) {
            for (int j = 0; j < num; j++) {
                this.edges[i][j] = 0;
            }
        }
    }

    //添加无向边
    public void addEdge(int v1, int v2) {
        //1表示两点连通
        edges[v1][v2] = edges[v2][v1] = 1;
    }

    //删除无向边
    public void delEdge(int v1, int v2) {
        //0表示两点不连通
        edges[v1][v2] = edges[v2][v1] = 0;
    }

    //广度优先遍历
    /*
    主要思想：
    1、首先以一个未被访问过的顶点作为起始顶点，访问其所有相邻的顶点；
    2、然后对每个相邻的顶点，再访问它们相邻的未被访问过的顶点；
    3、直到所有顶点都被访问过，遍历结束。
     */
    public void bfs(int startVex) {
        //访问数组，访问过的节点标注为true,未访问过的节点标注为false
        boolean[] visited = new boolean[edges[0].length];
        //申请一个队列
        Deque<Integer> queue = new ArrayDeque<>();
        queue.push(startVex);
        visited[startVex] = true;
        while (!queue.isEmpty()) {
            int cur = queue.pollLast();
            System.out.println(vertexs.get(cur));
            //cur节点的第一个邻接节点
            int w = getFirstVex(cur);
            while (w != -1) {
                //w节点没有被访问过，则入队列
                if (!visited[w]) {
                    queue.push(w);
                    //将w节点标记为已访问状态
                    visited[w] = true;
                }
                //cur节点的下一个邻接节点
                w = getNextVex(cur, w);
            }
        }
    }

    //深度优先遍历
    public void dfs(int cur, boolean[] visited) {
        //访问cur节点
        System.out.println(vertexs.get(cur));
        //将cur节点标记为已访问状态
        visited[cur] = true;
        //cur节点的第一个邻接节点
        int w = getFirstVex(cur);
        while (w != -1) {
            //w没有被访问过
            if (!visited[w]) {
                dfs(w, visited);
            }
            //cur节点的下一个邻接节点
            w = getNextVex(cur, w);
        }
    }

    //获取v节点的第一个邻接节点
    private int getFirstVex(int v) {
        for (int j = 0; j < edges[0].length; j++) {
            if (edges[v][j] != 0) {
                return j;
            }
        }
        //该点与其他点不连通
        return -1;
    }

    //获取v1节点的下一个邻接节点
    private int getNextVex(int v1, int v2) {
        for (int j = v2 + 1; j < edges[0].length; j++) {
            if (edges[v1][j] != 0) {
                return j;
            }
        }
        //该点不存在下一个邻接节点
        return -1;
    }

}

public class GraphTraverse {
    public static void main(String[] args) {
        //               0    1    2    3    4    5    6
        char[] chars = {'A', 'B', 'C', 'D', 'E', 'F', 'G'};
        List<Character> vertexs = new ArrayList<>();
        for (char ch : chars) {
            vertexs.add(ch);
        }
        Graph graph = new Graph(vertexs.size(), vertexs);

        int[][] matrix = {
                //A  B  C  D  E  F  G
                /*A*/ {0, 1, 0, 1, 1, 1, 0},
                /*B*/ {1, 0, 1, 0, 0, 1, 0},
                /*C*/ {0, 1, 0, 1, 0, 0, 1},
                /*D*/ {1, 0, 1, 0, 1, 0, 1},
                /*E*/ {1, 0, 0, 1, 0, 1, 1},
                /*F*/ {1, 1, 0, 0, 1, 0, 1},
                /*G*/ {0, 0, 1, 1, 1, 1, 0}
        };

        for (int i = 0; i < matrix.length; i++) {
            for (int j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] == 1) {
                    graph.addEdge(i, j);
                }
            }
        }
        //graph.bfs(0);
        boolean[] visited = new boolean[vertexs.size()];
        graph.dfs(0, visited);
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