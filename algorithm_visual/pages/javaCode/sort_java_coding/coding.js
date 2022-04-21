//小于号
const lt = "<text decode='true'>&lt;</text>"
//大于号
const gt = "<text decode='true'>&gt;</text>"

const text = `
<pre>package algorithm.java_coding;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.Queue;

public class Sort {
    //main方法，测试各个排序方法
    public static void main(String[] args) {
        int[] arr = {113, 8, 145, 42, 106, 56, 64, 98, 88, 124};
//        bubbleSort(arr);
//        selectSort(arr);
//        insertSort(arr);
//        shellSort(arr);
//        mergeSort(arr, 0, arr.length - 1);
//        quickSort(arr, 0, arr.length - 1);
//        heapSort(arr);
//        radixSort(arr);
//        System.out.println(Arrays.toString(arr));
//        排序正确结果
//        [8, 42, 56, 64, 88, 98, 106, 113, 124, 145]
    }

    //冒泡排序
    public static void bubbleSort(int[] arr) {
        int temp;//临时变量
        boolean flag;//是否交换的标志
        for (int i = 0; i ${lt} arr.length - 1; i++) {   //表示趟数，一共 arr.length-1 次
            // 每次遍历标志位都要先置为false，才能判断后面的元素是否发生了交换
            flag = false;
            for (int j = 0; j ${lt} arr.length - i - 1; j++) { //选出该趟排序的最大值往后移动
                if (arr[j] ${gt} arr[j + 1]) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    flag = true;    //只要有发生了交换，flag就置为true
                }
            }
            //判断标志位是否为false，如果为false，说明后面的元素已经有序，就直接return
            if (!flag) break;
        }
    }

    //选择排序
    public static void selectSort(int[] arr) {
        for (int i = 0; i ${lt} arr.length - 1; i++) {
            int minIndex = i;
            //找"arr[i + 1]..a[arr.length]"之间最小元素对应的下标，并赋给minIndex
            for (int j = i + 1; j ${lt} arr.length; j++) {
                if (arr[j] ${lt} arr[minIndex]) {
                    minIndex = j;
                }
            }
            //若minIndex!=i，则交换 arr[i] 和 arr[minIndex]。
            //交换后，保证了arr[0]..arr[i]之间元素有序。
            if (minIndex != i) {
                int temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
        }
    }

    //插入排序
    public static void insertSort(int[] arr) {
        for (int i = 1; i ${lt} arr.length; i++) {
            int temp = arr[i], j = i;
            //在arr[0]...arr[i-1]寻找temp插入的位置
            while (j ${gt} 0 && temp ${lt} arr[j - 1]) {
                arr[j] = arr[j - 1];
                j--;
            }
            //将temp值插入到找到的合适的位置
            arr[j] = temp;
        }
    }

    //希尔排序
    public static void shellSort(int[] arr) {
        //gap 增量
        for (int gap = arr.length / 2; gap ${gt} 0; gap /= 2) {
            for (int i = gap; i ${lt} arr.length; i++) {
                int temp = arr[i], j = i;
                //寻找temp插入的位置
                while (j ${gt}= gap && temp ${lt} arr[j - gap]) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                //把temp值插入到找到的合适的位置
                arr[j] = temp;
            }
        }
    }

    //归并排序
    public static void mergeSort(int[] arr, int low, int high) {
        //递归结束条件
        if (low ${gt}= high) {
            return;
        }
        //将[low,high]区间分成两半
        int mid = (low + high) / 2;
        //对[low,mid]进行排序
        mergeSort(arr, low, mid);
        //对[mid+1,high]区间进行排序
        mergeSort(arr, mid + 1, high);
        //开辟一个长度为high-low+1的临时数组
        int[] temp = new int[high - low + 1];
        int L = low, R = mid + 1, tIndex = 0;
        //将[low,mid]有序区间与[mid+1,high]有序区间进行归并存放在临时数组中
        while (L ${lt}= mid && R ${lt}= high) {
            if (arr[L] ${lt} arr[R]) {
                temp[tIndex] = arr[L];
                L++;
            } else {
                temp[tIndex] = arr[R];
                R++;
            }
            tIndex++;
        }
        //System.arraycopy的函数原型是：
        //public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
        //其中：src表示源数组，srcPos表示源数组要复制的起始位置，desc表示目标数组，length表示要复制的长度。
        if (L ${lt}= mid) {
            System.arraycopy(arr, L, temp, tIndex, mid - L + 1);
        }
        if (R ${lt}= high) {
            System.arraycopy(arr, R, temp, tIndex, high - R + 1);
        }
        //将有序临时数组temp的值赋值到[low,high]区间中
        System.arraycopy(temp, 0, arr, low, temp.length);
    }

    //快速排序
    public static void quickSort(int[] arr, int low, int high) {
        //递归结束条件
        if (low ${gt}= high) {
            return;
        }
        //设定基准值
        int pivot = arr[high];
        //在[low,high]区间中将大于pivot的值放到右边，小于pivot的值放到左边
        int L = low, R = high;
        while (L ${lt} R) {
            //寻找比基准值pivot大的值的下标
            while (L ${lt} R && arr[L] ${lt}= pivot) {
                L++;
            }
            //此时L==R或者arr[L]${gt}pivot,将arr[L]放到右边
            arr[R] = arr[L];
            //寻找比基准值pivot小的值的下标
            while (L ${lt} R && arr[R] ${gt}= pivot) {
                R--;
            }
            //此时L==R或者arr[R]${lt}pivot,将arr[R]放到左边
            arr[L] = arr[R];
        }
        arr[L] = pivot;
        //对[low,L-1]区间进行排序
        quickSort(arr, low, L - 1);
        //对[L+1,high]区间进行排序
        quickSort(arr, L + 1, high);
    }

    //堆排序
    public static void heapSort(int[] arr) {
        //构建大顶堆
        for (int i = arr.length / 2 - 1; i ${gt}= 0; i--) {
            //从第一个非叶子结点从下至上，从右至左调整结构
            shifDow(arr, i, arr.length);
        }
        //调整堆结构+交换堆顶元素与末尾元素
        for (int i = arr.length - 1; i ${gt} 0; i--) {
            //交换堆顶元素与末尾元素
            int temp = arr[i];
            arr[i] = arr[0];
            arr[0] = temp;
            //调整堆结构
            shifDow(arr, 0, i);
        }

    }

    //向下调整位置，构建大顶堆
    public static void shifDow(int[] arr, int parent, int len) {
        // 有边界，因为是向下构建，只用到倒数第一个非叶子节点就可以了
        int half = len / 2;
        while (parent ${lt} half) {
            //因为parent ${lt} half, child的值不可能越界
            int child = parent * 2 + 1;
            int right = child + 1;
            if (right ${lt} len && arr[child] ${lt} arr[right]) {
                //右节点的值大于左节点的值，将right赋值给child
                child = right;
            }
            //满足小顶堆的性质，break
            if (arr[parent] ${gt}= arr[child]) {
                break;
            }
            //交换，较大的值充当父亲
            int temp = arr[parent];
            arr[parent] = arr[child];
            arr[child] = temp;
            // 因为出现了交换，为了保证交换下去的节点也能满足小顶堆，需要继续调整堆
            // 指定parent为child，进入下一次循环
            parent = child;
        }
    }

    //基数排序,不考虑负数情况
    public static void radixSort(int[] arr) {
        //用队列的方式，下标表示对应的位数的数值
        Queue${lt}Integer${gt}[] queues = new Queue[10];
        for (int i = 0; i ${lt} queues.length; i ++){
            queues[i] = new LinkedList${lt}${gt}();
        }
        //寻找数组中数值的最大位数
        int maxBit = -1;
        for (int num : arr) {
            maxBit = Math.max(maxBit, (num + "").length());
        }
        int dev = 1, bucket = 0;
        for (int count = 0; count ${lt} maxBit; count ++){
            for (int num : arr) {
                bucket = num / dev % 10;
                //将num添加到第bucket的桶中
                queues[bucket].add(num);
            }
            int i = 0;
            //取出桶中的值放入到arr数组中
            for (int j = 0; j ${lt} queues.length; j ++){
                while (!queues[j].isEmpty()){
                    arr[i ++] = queues[j].poll();
                }
            }
            dev *= 10;
        }
    }
}
</pre>
`
const coding = `package algorithm.java_coding;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.Queue;

public class Sort {
    //main方法，测试各个排序方法
    public static void main(String[] args) {
        int[] arr = {113, 8, 145, 42, 106, 56, 64, 98, 88, 124};
//        bubbleSort(arr);
//        selectSort(arr);
//        insertSort(arr);
//        shellSort(arr);
//        mergeSort(arr, 0, arr.length - 1);
//        quickSort(arr, 0, arr.length - 1);
//        heapSort(arr);
//        radixSort(arr);
//        System.out.println(Arrays.toString(arr));
//        排序正确结果
//        [8, 42, 56, 64, 88, 98, 106, 113, 124, 145]
    }

    //冒泡排序
    public static void bubbleSort(int[] arr) {
        int temp;//临时变量
        boolean flag;//是否交换的标志
        for (int i = 0; i < arr.length - 1; i++) {   //表示趟数，一共 arr.length-1 次
            // 每次遍历标志位都要先置为false，才能判断后面的元素是否发生了交换
            flag = false;
            for (int j = 0; j < arr.length - i - 1; j++) { //选出该趟排序的最大值往后移动
                if (arr[j] > arr[j + 1]) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    flag = true;    //只要有发生了交换，flag就置为true
                }
            }
            //判断标志位是否为false，如果为false，说明后面的元素已经有序，就直接return
            if (!flag) break;
        }
    }

    //选择排序
    public static void selectSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;
            //找"arr[i + 1]..a[arr.length]"之间最小元素对应的下标，并赋给minIndex
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            //若minIndex!=i，则交换 arr[i] 和 arr[minIndex]。
            //交换后，保证了arr[0]..arr[i]之间元素有序。
            if (minIndex != i) {
                int temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
        }
    }

    //插入排序
    public static void insertSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int temp = arr[i], j = i;
            //在arr[0]...arr[i-1]寻找temp插入的位置
            while (j > 0 && temp < arr[j - 1]) {
                arr[j] = arr[j - 1];
                j--;
            }
            //将temp值插入到找到的合适的位置
            arr[j] = temp;
        }
    }

    //希尔排序
    public static void shellSort(int[] arr) {
        //gap 增量
        for (int gap = arr.length / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < arr.length; i++) {
                int temp = arr[i], j = i;
                //寻找temp插入的位置
                while (j >= gap && temp < arr[j - gap]) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                //把temp值插入到找到的合适的位置
                arr[j] = temp;
            }
        }
    }

    //归并排序
    public static void mergeSort(int[] arr, int low, int high) {
        //递归结束条件
        if (low >= high) {
            return;
        }
        //将[low,high]区间分成两半
        int mid = (low + high) / 2;
        //对[low,mid]进行排序
        mergeSort(arr, low, mid);
        //对[mid+1,high]区间进行排序
        mergeSort(arr, mid + 1, high);
        //开辟一个长度为high-low+1的临时数组
        int[] temp = new int[high - low + 1];
        int L = low, R = mid + 1, tIndex = 0;
        //将[low,mid]有序区间与[mid+1,high]有序区间进行归并存放在临时数组中
        while (L <= mid && R <= high) {
            if (arr[L] < arr[R]) {
                temp[tIndex] = arr[L];
                L++;
            } else {
                temp[tIndex] = arr[R];
                R++;
            }
            tIndex++;
        }
        //System.arraycopy的函数原型是：
        //public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
        //其中：src表示源数组，srcPos表示源数组要复制的起始位置，desc表示目标数组，length表示要复制的长度。
        if (L <= mid) {
            System.arraycopy(arr, L, temp, tIndex, mid - L + 1);
        }
        if (R <= high) {
            System.arraycopy(arr, R, temp, tIndex, high - R + 1);
        }
        //将有序临时数组temp的值赋值到[low,high]区间中
        System.arraycopy(temp, 0, arr, low, temp.length);
    }

    //快速排序
    public static void quickSort(int[] arr, int low, int high) {
        //递归结束条件
        if (low >= high) {
            return;
        }
        //设定基准值
        int pivot = arr[high];
        //在[low,high]区间中将大于pivot的值放到右边，小于pivot的值放到左边
        int L = low, R = high;
        while (L < R) {
            //寻找比基准值pivot大的值的下标
            while (L < R && arr[L] <= pivot) {
                L++;
            }
            //此时L==R或者arr[L]>pivot,将arr[L]放到右边
            arr[R] = arr[L];
            //寻找比基准值pivot小的值的下标
            while (L < R && arr[R] >= pivot) {
                R--;
            }
            //此时L==R或者arr[R]<pivot,将arr[R]放到左边
            arr[L] = arr[R];
        }
        arr[L] = pivot;
        //对[low,L-1]区间进行排序
        quickSort(arr, low, L - 1);
        //对[L+1,high]区间进行排序
        quickSort(arr, L + 1, high);
    }

    //堆排序
    public static void heapSort(int[] arr) {
        //构建大顶堆
        for (int i = arr.length / 2 - 1; i >= 0; i--) {
            //从第一个非叶子结点从下至上，从右至左调整结构
            shifDow(arr, i, arr.length);
        }
        //调整堆结构+交换堆顶元素与末尾元素
        for (int i = arr.length - 1; i > 0; i--) {
            //交换堆顶元素与末尾元素
            int temp = arr[i];
            arr[i] = arr[0];
            arr[0] = temp;
            //调整堆结构
            shifDow(arr, 0, i);
        }

    }

    //向下调整位置，构建大顶堆
    public static void shifDow(int[] arr, int parent, int len) {
        // 有边界，因为是向下构建，只用到倒数第一个非叶子节点就可以了
        int half = len / 2;
        while (parent < half) {
            //因为parent < half, child的值不可能越界
            int child = parent * 2 + 1;
            int right = child + 1;
            if (right < len && arr[child] < arr[right]) {
                //右节点的值大于左节点的值，将right赋值给child
                child = right;
            }
            //满足小顶堆的性质，break
            if (arr[parent] >= arr[child]) {
                break;
            }
            //交换，较大的值充当父亲
            int temp = arr[parent];
            arr[parent] = arr[child];
            arr[child] = temp;
            // 因为出现了交换，为了保证交换下去的节点也能满足小顶堆，需要继续调整堆
            // 指定parent为child，进入下一次循环
            parent = child;
        }
    }

    //基数排序,不考虑负数情况
    public static void radixSort(int[] arr) {
        //用队列的方式，下标表示对应的位数的数值
        Queue<Integer>[] queues = new Queue[10];
        for (int i = 0; i < queues.length; i++) {
            queues[i] = new LinkedList<>();
        }
        //寻找数组中数值的最大位数
        int maxBit = -1;
        for (int num : arr) {
            maxBit = Math.max(maxBit, (num + "").length());
        }
        int dev = 1, bucket = 0;
        for (int count = 0; count < maxBit; count++) {
            for (int num : arr) {
                bucket = num / dev % 10;
                //将num添加到第bucket的桶中
                queues[bucket].add(num);
            }
            int i = 0;
            //取出桶中的值放入到arr数组中
            for (int j = 0; j < queues.length; j++) {
                while (!queues[j].isEmpty()) {
                    arr[i++] = queues[j].poll();
                }
            }
            dev *= 10;
        }
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