const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package algorithm.java_coding;

public class BinarySearchAndLineSearch {
    public static void main(String[] args) {

    }

    //线性查找
    public static int lineSearch(int [] arr, int value){
        for (int i = 0; i ${lt} arr.length; i ++){
            if (arr[i] == value){
                return i;
            }
        }
        return -1;
    }
    
    //二分查找
    public static int binarySearch(int [] arr, int value){
        int L = 0, R = arr.length - 1;
        while (L ${lt}= R){
            int mid = (L + R) / 2;
            if (arr[mid] > value){
                R = mid - 1;
            }else if (arr[mid] == value){
                return mid;
            }else {
                L = mid + 1;
            }
        }
        return -1;
    }
}
</pre>
`
const coding = `package algorithm.java_coding;

public class BinarySearchAndLineSearch {
    public static void main(String[] args) {

    }

    //线性查找
    public static int lineSearch(int [] arr, int value){
        for (int i = 0; i < arr.length; i ++){
            if (arr[i] == value){
                return i;
            }
        }
        return -1;
    }

    //二分查找
    public static int binarySearch(int [] arr, int value){
        int L = 0, R = arr.length - 1;
        while (L <= R){
            int mid = (L + R) / 2;
            if (arr[mid] > value){
                R = mid - 1;
            }else if (arr[mid] == value){
                return mid;
            }else {
                L = mid + 1;
            }
        }
        return -1;
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