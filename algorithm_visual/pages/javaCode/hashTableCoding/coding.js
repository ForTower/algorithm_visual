const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package datastruct.java_coding;

class Node {
    public int value;
    public Node next;

    public Node(int value) {
        this.value = value;
    }
}

class LinkHashTable {
    public Node[] arr = new Node[16];

    public LinkHashTable() {
        //每一条链表添加一个头结点
        for (int i = 0; i ${lt} arr.length; i++) {
            arr[i] = new Node(0);
        }
    }

    public void insert(int value) {
        Node newNode = new Node(value);
        //获取hash值
        int hash = hash(value);
        //遍历链表，如果value值在链表中已存在，则插入失败。
        //在链表的尾部插入newNode节点
        Node pre = arr[hash];
        Node cur = pre.next;
        while (cur != null) {
            if (cur.value == value) {
                System.out.println("该值在链表中已存在，插入失败");
                return;
            }
            pre = cur;
            cur = cur.next;
        }
        pre.next = newNode;
    }

    //返回值为value的节点的前驱节点
    public Node findPreNode(int value) {
        int hash = hash(value);
        Node pre = arr[hash];
        //前驱节点
        Node cur = pre.next;
        while (cur != null) {
            if (cur.value == value) {
                return pre;
            }
            pre = cur;
            cur = cur.next;
        }
        return null;
    }

    //返回值为value的节点
    public Node find(int value) {
        Node pre = findPreNode(value);
        return pre == null ? null : pre.next;
    }

    public void delete(int value) {
        //找到值为value的节点的前驱节点
        Node pre = findPreNode(value);
        if (pre == null) {
            System.out.println("该值在链表中不存在，删除失败。");
            return;
        }
       //删除值为value的节点
        pre.next = pre.next.next;
    }

    //遍历链式哈希表
    public void print(){
        for (int i = 0; i ${lt} arr.length; i++) {
            Node cur = arr[i].next;
            System.out.print(i + ": ");
            while (cur != null) {
                System.out.print(cur.value + " ");
                cur = cur.next;
            }
            System.out.println();
        }
    }

    private int hash(int value) {
        return value % arr.length;
    }
}

public class LinkHashCoding {
    public static void main(String[] args) {
        int[] nums = {902, 649, 49, 880, 673, 701, 538, 326, 148};
        LinkHashTable lht = new LinkHashTable();
        for (int num : nums) {
            lht.insert(num);
        }
//        lht.print();
        lht.delete(49);
//        lht.print();
        lht.delete(673);
        lht.print();
    }
}
</pre>
`
const coding = `package datastruct.java_coding;

class Node {
    public int value;
    public Node next;

    public Node(int value) {
        this.value = value;
    }
}

class LinkHashTable {
    public Node[] arr = new Node[16];

    public LinkHashTable() {
        //每一条链表添加一个头结点
        for (int i = 0; i < arr.length; i++) {
            arr[i] = new Node(0);
        }
    }

    public void insert(int value) {
        Node newNode = new Node(value);
        //获取hash值
        int hash = hash(value);
        //遍历链表，如果value值在链表中已存在，则插入失败。
        //在链表的尾部插入newNode节点
        Node pre = arr[hash];
        Node cur = pre.next;
        while (cur != null) {
            if (cur.value == value) {
                System.out.println("该值在链表中已存在，插入失败");
                return;
            }
            pre = cur;
            cur = cur.next;
        }
        pre.next = newNode;
    }

    //返回值为value的节点的前驱节点
    public Node findPreNode(int value) {
        int hash = hash(value);
        Node pre = arr[hash];
        //前驱节点
        Node cur = pre.next;
        while (cur != null) {
            if (cur.value == value) {
                return pre;
            }
            pre = cur;
            cur = cur.next;
        }
        return null;
    }

    //返回值为value的节点
    public Node find(int value) {
        Node pre = findPreNode(value);
        return pre == null ? null : pre.next;
    }

    public void delete(int value) {
        //找到值为value的节点的前驱节点
        Node pre = findPreNode(value);
        if (pre == null) {
            System.out.println("该值在链表中不存在，删除失败。");
            return;
        }
       //删除值为value的节点
        pre.next = pre.next.next;
    }

    //遍历链式哈希表
    public void print(){
        for (int i = 0; i < arr.length; i++) {
            Node cur = arr[i].next;
            System.out.print(i + ": ");
            while (cur != null) {
                System.out.print(cur.value + " ");
                cur = cur.next;
            }
            System.out.println();
        }
    }

    private int hash(int value) {
        return value % arr.length;
    }
}

public class LinkHashCoding {
    public static void main(String[] args) {
        int[] nums = {902, 649, 49, 880, 673, 701, 538, 326, 148};
        LinkHashTable lht = new LinkHashTable();
        for (int num : nums) {
            lht.insert(num);
        }
//        lht.print();
        lht.delete(49);
//        lht.print();
        lht.delete(673);
        lht.print();
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