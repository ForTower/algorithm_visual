
const text = `
<pre>package datastruct.java_coding;

//数组方式实现栈
class MyArrayStack {
    private Object[] arr = new Object[20];
    //栈的长度
    private int size;

    //进栈
    public void push(Object value) {
        if (size == arr.length) {
            System.out.println("栈已满，进栈失败。");
            return;
        }
        arr[size] = value;
        size++;
    }

    //出栈
    public Object poll() {
        if (size == 0) {
            System.out.println("栈为空，出栈失败。");
            return null;
        }
        Object value = arr[--size];
        return value;
    }
}

//链表方式实现栈
class MyLinkStack {
    //栈的长度
    private int size;
    //指向头结点的指针
    private Node head;

    //节点
    private static class Node {
        private Object value;
        private Node next;

        private Node(Object value) {
            this.value = value;
        }
    }

    //进栈
    public void push(Object value) {
        size++;
        Node newNode = new Node(value);
        if (head == null) {
            head = newNode;
            return;
        }
        newNode.next = head.next;
        head.next = newNode;
    }

    //出栈
    public Object poll() {
        if (head == null) {
            System.out.println("栈为空，出栈失败。");
            return null;
        }
        Object value = head.value;
        head = head.next;
        size--;
        return value;
    }
}

//数组方式实现队列
class ArrayQueue {
    private Object[] arr = new Object[20];
    //队列的头部，获取数据时总是从头部获取
    private int head;
    //队列尾部，enqueue数据时总是从尾部添加
    private int tail;
    //队列长度
    private int size;

    //入队
    public void enqueue(Object value) {
        if (size == arr.length) {
            System.out.println("队列已满，入队失败。");
            return;
        }
        //从尾部添加数据
        arr[tail] = value;
        size++;
        tail = (tail + 1) % arr.length;
    }

    //出队
    public Object dequeue() {
        if (size == 0) {
            System.out.println("队列为空，出队失败。");
            return null;
        }
        //从头部获取数据
        Object value = arr[head];
        size--;
        head = (head + 1) % arr.length;
        return value;
    }
}

//链表方式实现队列
class LinkQueue {
    //队列的长度
    private int size;
    //队列的头部指针，获取数据时总是从头部获取
    private Node head;
    //队列尾部指针，enqueue数据时总是从尾部添加
    private Node tail;

    //节点
    private static class Node {
        private Object value;
        private Node next;

        private Node(Object value) {
            this.value = value;
        }
    }

    //入队
    public void enqueue(Object value) {
        Node newNode = new Node(value);
        if (tail == null) {
            head = tail = newNode;
            return;
        }
        //从尾部添加数据
        tail.next = newNode;
        tail = newNode;
        //队列的长度加1
        size++;
    }

    //出队
    public Object dequeue() {
        if (head == null) {
            System.out.println("队列为空，出队失败。");
            return null;
        }
        //从队列的头部取数据
        Object value = head.value;
        head = head.next;
        if (head == null) {
            tail = null;
        }
        //队列的长度减1
        size--;
        return value;
    }

}

public class StackAndQueue {
    public static void main(String[] args) {
    }
}
</pre>
`
const coding = `package datastruct.java_coding;

//数组方式实现栈
class MyArrayStack {
    private Object[] arr = new Object[20];
    //栈的长度
    private int size;

    //进栈
    public void push(Object value) {
        if (size == arr.length) {
            System.out.println("栈已满，进栈失败。");
            return;
        }
        arr[size] = value;
        size++;
    }

    //出栈
    public Object poll() {
        if (size == 0) {
            System.out.println("栈为空，出栈失败。");
            return null;
        }
        Object value = arr[--size];
        return value;
    }
}

//链表方式实现栈
class MyLinkStack {
    //栈的长度
    private int size;
    //指向头结点的指针
    private Node head;

    //节点
    private static class Node {
        private Object value;
        private Node next;

        private Node(Object value) {
            this.value = value;
        }
    }

    //进栈
    public void push(Object value) {
        size++;
        Node newNode = new Node(value);
        if (head == null) {
            head = newNode;
            return;
        }
        newNode.next = head.next;
        head.next = newNode;
    }

    //出栈
    public Object poll() {
        if (head == null) {
            System.out.println("栈为空，出栈失败。");
            return null;
        }
        Object value = head.value;
        head = head.next;
        size--;
        return value;
    }
}

//数组方式实现队列
class ArrayQueue {
    private Object[] arr = new Object[20];
    //队列的头部，获取数据时总是从头部获取
    private int head;
    //队列尾部，enqueue数据时总是从尾部添加
    private int tail;
    //队列长度
    private int size;

    //入队
    public void enqueue(Object value) {
        if (size == arr.length) {
            System.out.println("队列已满，入队失败。");
            return;
        }
        //从尾部添加数据
        arr[tail] = value;
        size++;
        tail = (tail + 1) % arr.length;
    }

    //出队
    public Object dequeue() {
        if (size == 0) {
            System.out.println("队列为空，出队失败。");
            return null;
        }
        //从头部获取数据
        Object value = arr[head];
        size--;
        head = (head + 1) % arr.length;
        return value;
    }
}

//链表方式实现队列
class LinkQueue {
    //队列的长度
    private int size;
    //队列的头部指针，获取数据时总是从头部获取
    private Node head;
    //队列尾部指针，enqueue数据时总是从尾部添加
    private Node tail;

    //节点
    private static class Node {
        private Object value;
        private Node next;

        private Node(Object value) {
            this.value = value;
        }
    }

    //入队
    public void enqueue(Object value) {
        Node newNode = new Node(value);
        if (tail == null) {
            head = tail = newNode;
            return;
        }
        //从尾部添加数据
        tail.next = newNode;
        tail = newNode;
        //队列的长度加1
        size++;
    }

    //出队
    public Object dequeue() {
        if (head == null) {
            System.out.println("队列为空，出队失败。");
            return null;
        }
        //从队列的头部取数据
        Object value = head.value;
        head = head.next;
        if (head == null) {
            tail = null;
        }
        //队列的长度减1
        size--;
        return value;
    }

}

public class StackAndQueue {
    public static void main(String[] args) {
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