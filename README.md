# xu-yu-chia.github.io

<body bgcolor="orange">

<h1>標題1</h1>
<h2>標題2</h2>
<h3>標題3</h3>

<p><strong>粗體</strong>或是<i>斜體</i>或是<strong><i>粗體加斜體</i></strong></p>
<p>需要格行<br>格行</p>
<p>需要格行<br><br>格兩行</p>

<p>願望清單</p>
<ul>
  <li>清單1</li>
  <li>清單2</li>
  <li>清單3</li>
</ul>

<br>

<ol>
  <li>清單1</li>
  <li>清單2</li>
  <li>清單3</li>
</ol>

<a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley'>原網頁開啟超連結</a>

<br>

<a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley' target='_blank'>另開網頁開啟超連結</a>


<br>

<p>-----------------------------------------------------</p>


<br>


# 自主學習


https://www.canva.com/design/DAFRmDoIbNI/wqj3g3NfpTPlNMsIDyOVrg/edit


## 基本語法知識


### while(T- -)
>這樣可以讓迴圈直接執行T次
```cpp=
int T;
while(T--)//等於while((T-1)>0){}
{
    cout<<T<<endl;
}

```



### auto
> ```auto```自動判斷型態
> 減少要記憶的名稱
```cpp=
vecter<int> v {10,20,30}

auto str = v.begin();
auto end = v.end();

while(str != end){
    cout<< *str++ <<" "; //*是指標，類似    門牌號碼
}
//輸出10 20 30
```

### C++整行讀取
> 分成兩種 
> > `cin.getline`
> > > 將資料讀入char[n] (陣列形式字串)
> > > **格式**:`cin.getline( 陣列名稱 , 該陣列大小 , 結束字元 );`
> > > **備註**:結束字元預設為 `'\n'`，通常會省略
```cpp=
char str[99];
cin.getline(str,99,'\n'); //輸入: 1357 2468 abcd
cout << str << endl;//輸出: 1357 2468 abcd
```

> > `getline`
> > > 將資料讀入string中
> > > **格式**:`getline( 串流物件讀取類型 , 要存放的字串 , 結束字元 )`
> > > **備註**:結束字元預設為 `'\n'`，通常會省略
```cpp=
string str;
getline(cin,str,'\n');//輸入: 1357 2468 abcd
cout << str << endl;//輸出: 1357 2468 abcd
```



### std::pair

> **宣告**:``` pair<資料類型,資料類型> a[9];```
> **取值**:``` cout<<a[1].first<<" "<<a[1].second;```
> **備註**:``` pair<int,pair<int,double>> a;```

---


**題目**
*a915: 二维点排序*
https://zerojudge.tw/ShowProblem?problemid=a915

**解題思路:**
1. 輸入(x,y)
2. 用```pair```把兩個XY綁在一起
3. 用```sort```排序
4. 輸出答案


**遇到的困境:**
1. 因為還在適應```pair```的使用法，所以使用過程中會卡卡的



**程式碼:**



```cpp=
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define endl '\n'

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    int n;
    cin>>n;
    pair<int,int> p[n];
    
    for(int j=0;j<n;j++)
    cin>>p[j].first>>p[j].second;
    sort(p,p+n);
    for(int i=0;i<n;i++)
    cout<<p[i].first<<" "<<p[i].second<<endl;

}

```

### std::tuple

> 宣告:`tuple<資料類型,資料類型.....,資料類型> a[99]`;
> 取值: `cout<< get<0>(a) <<" "<< get<n>(a);`


---

```cpp=

int x,y,z;
tuple<int,int,double,int> a;
tie(x , y , std::ignore , z) = a ;
cout<< x << " " << y << " " << z << endl; //忽略第三個數，只定義1,2,4個數字
```                      

    





### std::vector

> 宣告: vector<資料類型>a[10];
> 取值: cout<<a[i]<<" "<<a[i+1];
> 備註: v.emplace_back(ans); //把值ans推入v的vector 


---

**題目**
*f819: 圖書館 (Library)*
https://zerojudge.tw/ShowProblem?problemid=f819

**解題思路:**
1. 輸入書籍編號和借閱天數
2. 用`pair`把兩個XY綁在一起
3. 用`sort`排序書籍編號
4. 判斷是否逾期未還
5. 把逾期的書推進`vector`
6. 輸出答案


**遇到的困境:**
1. 要輸出vector的資料時要先用.size()讀出那裏面有多少資料，不然會不知道迴圈要回多少次



**程式碼:**



```cpp=
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define endl '\n'

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    int n,m=0;
    vector<int> v;
    v.clear();
    cin>>n;
    pair<int,int> b[n];
    for(int i=0;i<n;i++)
    cin>>b[i].first>>b[i].second;
    sort(b,b+n);
    for(int j=0;j<n;j++){
        if(b[j].second>100){
            m+=b[j].second-100;
            v.emplace_back(b[j].first);
        }
        
    }
    int y=v.size();
    if(y>0){
        for(int i=0;i<y;i++)
            cout<<v[i]<<" ";
    }
    if(m>0){
        cout<<endl;
    }
    cout<<m*5<<endl;
    
    
}
```



## 基本技巧



### <<和>>
> 用法:`int a >> n;`或`int b << m;`
> 上面兩行分別代表`a/(2^n)`和`b*(2^m)`
> 右移運算子`>>`簡單來說就是將數除以2的n次方
> 左移運算子`<<`簡單來說就是將數乘以2的n次方

---

```cpp=
int a = 5;        // binary: 00000000000000000000000000000101 十進制中的5
int b = a << 3;   // binary: 00000000000000000000000000101000 十進制中的40 = 5*2^3
int c = b >> 3;   // binary: 00000000000000000000000000000101 十進制中的5 = 40/(2^3)
```


### 遞迴

> 簡單來說就是類似國中學到的y=f(x)=f(x-1)......
> 河內塔就是最經典的題目


---

**題目**
*a227: 三龍杯 -> 河內之塔*
https://zerojudge.tw/ShowProblem?problemid=a227

**解題思路:**
1. 設計函式
2. 設定遞回終止式
3. 把數字帶入函數
4. 輸出答案

**遇到的困境:**
1. 因為本題還要求把位置標出來，所以思路要很清楚



**程式碼:**
```cpp=

#include <bits/stdc++.h>
using namespace std;

void hannoi(int n,char A,char B,char C){
    if(n==0)
        return;
    hannoi(n-1,A,C,B);
    printf("Move ring %d from %c to %c \n",n,A,C);
    hannoi(n-1,B,A,C);
}

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    
    int n;
    while(cin>>n){
        hannoi(n,'A','B','C');
    }
    
}

```

---




**題目**
*e357: 遞迴函數練習*
https://zerojudge.tw/ShowProblem?problemid=e357

**解題思路:**
1. 輸入數字X
2. 把X帶入f函數中跑
3. 輸出結果

**遇到的困境:**
1. 因為一開始不知道遞迴中的```return```用法代表回傳質，所以寫的比較慢



**程式碼:**
```cpp=
#include <bits/stdc++.h>
using namespace std;
#define ll long long
#define endl '\n'

int f(int a){
    if(a==1)
        return 1;
    else if(a%2==0)
        return a=f(a/2);
    else
        return a=f(a+1)+f(a-1);
}

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    int a;
    cin>>a;
    cout<<f(a);
}
```
### 快速冪
> 冪，就是指數運算，也就是a^b
> 最簡單算出密次的方式就是用迴圈跑n次，但是時間複雜度會到O(n)
> 一步步可以簡化為:

```cpp=
int power(int a ,int b){
    if(b==0)
        return 1;
    else if(b%2==1)
        return (a*power(a,b-1))%m;
    else{
        int tmp=power(a,b/2);
        return (tmp*tmp)%m;
    }
}
```

---

**題目**
*Exponentiation*
https://cses.fi/problemset/task/1095/

**解題思路:**
1. 輸入測資個數和測資
2. 把測資帶入快速冪函式
3. 再函式內取1000000007的餘數
4. 輸出運算結果

**遇到的困境:**
1. 因為一開始我在函式輸出之後才取函式，但是怎麼測都錯，所以我推測函式輸出出藍的質早就已經超過2^64了，所以最後我決定在函式內直接先取餘數



**程式碼:**
```cpp=
#include <bits/stdc++.h>
using namespace std;
#define ll unsigned long long
#define endl '\n'

ll n,m=1000000007;

ll power(ll a ,ll b){
    if(b==0)
        return 1;
    else if(b%2==1)
        return (a*power(a,b-1))%m;
    else{
        ll tmp=power(a,b/2);
        return (tmp*tmp)%m;
    }
}

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    cin>>n;
    pair<int,int> a[n];
    for(int i=0;i<n;i++){
        cin>>a[i].first>>a[i].second;
        cout<<power(a[i].first,a[i].second)<<endl;
    }
}
```

### 最大公因數
> 要求出(a,b)兩數之最大公因數，最值觀的方法為枚舉所有可能之因數，但這樣太慢了!
> 上述之程式碼如下:

```cpp=
int gcd(int a,int b){
    for(int i = min(a,b) ; i>=2 ; i--){
        if(a%i == 0 && b%i == 0){
            return i;
        }
    }
    return 1;
}
```
> 可以依輾轉相除法的想法和取於數的想法簡化為:

```cpp=
//在a<=b的前提下
int gcd(int a,int b){
    if(b==0){
        return a;
    }
    else{
        return gcd( b , a%b );
    }
}
```


### Merge Sort

> merge sort就是一直把陣列一分為二，然後分別排序
> 再來就是把兩個陣列合併
> 用merge sort可以把時間複雜度變成O(nlog n)
> 程式碼如下:

```cpp=
void mergesort(int *arr,int len){
    
    
    if(len<=1)
        return;
    int leftlen=len/2,rightlen=len-leftlen;
    int *leftarr=arr,*rightarr=arr+leftlen;
    mergesort(leftarr,leftlen);
    mergesort(rightarr,rightlen);
    
    static int tmp[1000000];
    int tmplen=0,l=0,r=0;
    while(l<leftlen && r<rightlen){
        if(leftarr[l]<rightarr[r])
            tmp[tmplen++]=leftarr[l++];
        else
            tmp[tmplen++]=rightarr[r++];
    }
    while(l<leftlen)
        tmp[tmplen++]=leftarr[l++];
    while(r<rightlen)
        tmp[tmplen++]=rightarr[r++];
    for(int i=0;i<tmplen;i++)
        arr[i]=tmp[i];
    
}
```

---

**題目**
*a233: 排序法~~~ 挑戰極限*
https://zerojudge.tw/ShowProblem?problemid=a233

**解題思路:**
1. 輸入陣列
2. 用Merge Sort去排序陣列
3. 輸出排序後陣列

**遇到的困境:**
1. 因為是第一次使用Merge Sort，所以先按照書上的程式碼打
2. 找不到bug在哪



**程式碼:**
```cpp=
#include <bits/stdc++.h>

using namespace std;

void mergesort(int *arr,int len){
    
    
    if(len<=1)
        return;
    int leftlen=len/2,rightlen=len-leftlen;
    int *leftarr=arr,*rightarr=arr+leftlen;
    mergesort(leftarr,leftlen);
    mergesort(rightarr,rightlen);
    
    static int tmp[1000000];
    int tmplen=0,l=0,r=0;
    while(l<leftlen && r<rightlen){
        if(leftarr[l]<rightarr[r])
            tmp[tmplen++]=leftarr[l++];
        else
            tmp[tmplen++]=rightarr[r++];
    }
    while(l<leftlen)
        tmp[tmplen++]=leftarr[l++];
    while(r<rightlen)
        tmp[tmplen++]=rightarr[r++];
    for(int i=0;i<tmplen;i++)
        arr[i]=tmp[i];
    
}

int main()
{
    int n;
    cin>>n;
    int a[n];
    for(int i=0;i<n;i++){
        cin>>a[i];
    }
    mergesort(a,n);
    for(int i=0;i<n;i++){
        cout<<a[i]<<" ";
    }
    
}


```

### Counting Sort
> 這種排去方法是先把陣列(範圍0~k)中最大值k找出來
> 然後開一個陣列`int count[k];`
> 然後去跑陣列一次並把陣列中的值(n)相對應的`count[n]`加一
> 最後再跑`count`陣列一遍，一續把值(m)相對應的輸出(`count[m]`)次
> 這種方法的缺點是如果最大值(k)過大需要開超大的陣列
> 以至於耽誤了執行時間或是記憶體不足無法執行
> 程式碼如下:

```cpp=
vector<int> countingsort(const vector<int> &arr)
{
    int n=arr.size();
    int k=*max_element(arr.begin(),arr.end());
    vector<int> result(n);
    vector<int> cnt(k+1,0);
    for(int i=0;i<n;i++){
        cnt[arr[i]]++;
    }
    for(int i=1;i<=k;i++){
        cnt[i] += cnt[i-1];
    }
    for(int i=n-1;i>=0;i--){
        int x=arr[i];
        result[--cnt[x]]=x;
    }
    for(int i=0;i<n;i++){
        cout<<result[i]<<" ";
    }
    return result;
}

```

---


**題目**
*a233: 排序法~~~ 挑戰極限*
https://zerojudge.tw/ShowProblem?problemid=a233

**解題思路:**
1. 輸入陣列元素,並用`vector`儲存 
2. 使用`countingsort`
3. 輸出答案

**遇到的困境:**
1. 第一次使用`counting sort`所以過程中卡卡的
2. 因為題目本來就是設計給`Merge sort` 的所以最後只有`NA(55%)`，是因為記憶體不足的關係
![](https://i.imgur.com/oihlefs.png)

![](https://i.imgur.com/MGXGw1D.png)




**程式碼:**
```cpp=
#include <bits/stdc++.h>

using namespace std;

vector<int> countingsort(const vector<int> &arr)
{
    int n=arr.size();
    int k=*max_element(arr.begin(),arr.end());
    vector<int> result(n);
    vector<int> cnt(k+1,0);
    for(int i=0;i<n;i++){
        cnt[arr[i]]++;
    }
    for(int i=1;i<=k;i++){
        cnt[i] += cnt[i-1];
    }
    for(int i=n-1;i>=0;i--){
        int x=arr[i];
        result[--cnt[x]]=x;
    }
    for(int i=0;i<n;i++){
        cout<<result[i]<<" ";
    }
    return result;
}

int main()
{
    vector<int> a;
    a.clear();
    int n;
    cin>>n;
    for(int i=0;i<n;i++){
        int m;
        cin>>m;
        a.emplace_back(m);
    }
    countingsort(a);
    
    
}
```

### std::sort()
> 就是最簡單易懂的`sort`
> 呼叫方式如下:
```cpp=
sort(a,a+n);
sort(陣列名稱,陣列名稱+要排序的個數);
```


**題目**
d190: 11462 - Age Sort
https://zerojudge.tw/ShowProblem?problemid=d190
**解題思路:**
1. 輸入陣列
2. 用`sort`排序
3. 輸出答案

**遇到的困境:**
1. 因為題目多了輸入0來中止排序，所以使用`while()`和`if()`來判斷是否要執行下去



**程式碼**
    
```cpp=
#include <bits/stdc++.h>

using namespace std;

int main()
{
    int n;
    while(cin>>n){
        if(n==0)
            return 0;
        else{
                int a[n];
        for(int i=0;i<n;i++)
        {
            cin>>a[i];
        }
            sort(a,a+n);
        for(int i=0;i<n;i++)
        {
            cout<<a[i]<<" ";
        }
            cout<<'\n';
        }
    }
    
    
}
```
