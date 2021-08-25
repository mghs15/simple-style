# simple-style
地理院地図Vectorをシンプルなスタイルで表示してみる試み。

demo https://mghs15.github.io/simple-style/index.html

ついでに、緑に乏しいので、植生記号の周りに、緑の点々を表示して、草が生えてる感じにしてみた。

demo https://mghs15.github.io/simple-style/vegetation.html

## スタイルのシンプル化にあたって
* 国道/県道/市町村道やJR/私鉄といった管理・運営主体の区別を削除。
  * 道路の色はデータドリブンで国道/県道/市町村道を区別
* 幅員（13mを境に2区分）や単複の区別のみ
* 階層はトンネル/通常部/高架/高架1/高架2の区別

## 参考文献
https://github.com/gsi-cyberjapan/gsivectortile-3d-like-building

スタイルの設計に当たっては、Ordnance SurveyやSwisstopoのベクトルタイルのスタイルを参考にした。
