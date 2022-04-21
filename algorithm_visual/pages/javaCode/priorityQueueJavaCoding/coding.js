const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package datastruct.java_coding;

class MyPriorityQueue {
    //优先队列的长度
    private int size;
    private int[] arr = new int[20];
    private MyComparable cmp;

    public MyPriorityQueue(MyComparable cmp) {
        this.cmp = cmp;
    }

    public void push(int value) {
        if (size >= arr.length) {
            System.out.println("优先队列已满，进队失败。");
            return;
        }
        arr[size] = value;
        //向上调整
        shifUp(size);
        size++;
    }

    public int pop() {
        if (size == 0) {
            System.out.println("优先队列为空，出队失败。");
            return -1;
        }
        int value = arr[0];
        arr[0] = arr[--size];
        //向下调整
        shifDow(arr, 0, size);
        return value;
    }

    //为了保持大顶堆（小顶堆）的性质，每进队一次，都要向上重新调整
    private void shifUp(int k) {
        while (k > 0) {
            int parent = (k - 1) / 2;
            if (cmp.compareTo(arr[k], arr[parent]) ${lt} 0) {
                int temp = arr[k];
                arr[k] = arr[parent];
                arr[parent] = temp;
                k = parent;
            } else {
                break;
            }
        }
    }

    //向下调整位置，构建大顶堆(小顶堆)
    private void shifDow(int[] arr, int parent, int len) {
        // 有边界，因为是向下构建，只用到倒数第一个非叶子节点就可以了
        int half = len / 2;
        while (parent ${lt} half) {
            //因为parent ${lt} half, child的值不可能越界
            int child = parent * 2 + 1;
            int right = child + 1;
            if (right ${lt} len && cmp.compareTo(arr[child], arr[right]) > 0) {
                //右节点的值大于左节点的值，将right赋值给child
                child = right;
            }
            //满足大顶堆(小顶堆)的性质，break
            if (cmp.compareTo(arr[parent], arr[child]) ${lt}= 0) {
                break;
            }
            //交换，较大的值充当父亲
            int temp = arr[parent];
            arr[parent] = arr[child];
            arr[child] = temp;
            // 因为出现了交换，为了保证交换下去的节点也能满足小顶堆(大顶堆)，需要继续调整堆
            // 指定parent为child，进入下一次循环
            parent = child;
        }
    }

    public boolean isEmpty() {
        return size == 0;
    }
}

@FunctionalInterface
interface MyComparable {
    public int compareTo(int val1, int val2);
}

public class MyPriorityQueueCoding {
    public static void main(String[] args) {
        int[] arr = {4, 11, 54, 9, 10, 89, 43, 19, 68, 109, 235, 236, 77};
        //构建小顶堆
//        MyPriorityQueue pq = new MyPriorityQueue((val1, val2) -> val1 - val2);
//        for (int value : arr) {
//        进队
//            pq.push(value);
//        }
//        while (!pq.isEmpty()) {
//            System.out.print(pq.pop() + " ");
//        }
        //输出结果
        //4 9 10 11 19 43 54 68 77 89 109 235 236

        //构建大顶堆
        MyPriorityQueue pq = new MyPriorityQueue((val1, val2) -> val2 - val1);
        for (int value : arr) {
            //进队
            pq.push(value);
        }
        while (!pq.isEmpty()) {
            System.out.print(pq.pop() + " ");
        }
        //输出结果
        // 236 235 109 89 77 68 54 43 19 11 10 9 4
    }
}
</pre>
`
const coding = `package datastruct.java_coding;

class MyPriorityQueue {
    //优先队列的长度
    private int size;
    private int[] arr = new int[20];
    private MyComparable cmp;

    public MyPriorityQueue(MyComparable cmp) {
        this.cmp = cmp;
    }

    public void push(int value) {
        if (size >= arr.length) {
            System.out.println("优先队列已满，进队失败。");
            return;
        }
        arr[size] = value;
        //向上调整
        shifUp(size);
        size++;
    }

    public int pop() {
        if (size == 0) {
            System.out.println("优先队列为空，出队失败。");
            return -1;
        }
        int value = arr[0];
        arr[0] = arr[--size];
        //向下调整
        shifDow(arr, 0, size);
        return value;
    }

    //为了保持大顶堆（小顶堆）的性质，每进队一次，都要向上重新调整
    private void shifUp(int k) {
        while (k > 0) {
            int parent = (k - 1) / 2;
            if (cmp.compareTo(arr[k], arr[parent]) < 0) {
                int temp = arr[k];
                arr[k] = arr[parent];
                arr[parent] = temp;
                k = parent;
            } else {
                break;
            }
        }
    }

    //向下调整位置，构建大顶堆(小顶堆)
    private void shifDow(int[] arr, int parent, int len) {
        // 有边界，因为是向下构建，只用到倒数第一个非叶子节点就可以了
        int half = len / 2;
        while (parent < half) {
            //因为parent < half, child的值不可能越界
            int child = parent * 2 + 1;
            int right = child + 1;
            if (right < len && cmp.compareTo(arr[child], arr[right]) > 0) {
                //右节点的值大于左节点的值，将right赋值给child
                child = right;
            }
            //满足大顶堆(小顶堆)的性质，break
            if (cmp.compareTo(arr[parent], arr[child]) <= 0) {
                break;
            }
            //交换，较大的值充当父亲
            int temp = arr[parent];
            arr[parent] = arr[child];
            arr[child] = temp;
            // 因为出现了交换，为了保证交换下去的节点也能满足小顶堆(大顶堆)，需要继续调整堆
            // 指定parent为child，进入下一次循环
            parent = child;
        }
    }

    public boolean isEmpty() {
        return size == 0;
    }
}

@FunctionalInterface
interface MyComparable {
    public int compareTo(int val1, int val2);
}

public class MyPriorityQueueCoding {
    public static void main(String[] args) {
        int[] arr = {4, 11, 54, 9, 10, 89, 43, 19, 68, 109, 235, 236, 77};
        //构建小顶堆
//        MyPriorityQueue pq = new MyPriorityQueue((val1, val2) -> val1 - val2);
//        for (int value : arr) {
//        进队
//            pq.push(value);
//        }
//        while (!pq.isEmpty()) {
//            System.out.print(pq.pop() + " ");
//        }
        //输出结果
        //4 9 10 11 19 43 54 68 77 89 109 235 236

        //构建大顶堆
        MyPriorityQueue pq = new MyPriorityQueue((val1, val2) -> val2 - val1);
        for (int value : arr) {
            //进队
            pq.push(value);
        }
        while (!pq.isEmpty()) {
            System.out.print(pq.pop() + " ");
        }
        //输出结果
        // 236 235 109 89 77 68 54 43 19 11 10 9 4
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