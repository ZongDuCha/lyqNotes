打开ruby安装的目录，一般安装在c盘

例如: `C:\Ruby23\lib\ruby\gems\2.3.0\gems\sass-3.5.6\lib\sass\engine.rb`

找到`engine.rb`文件

在module Sass上面添加一句
Encoding.default_external = Encoding.find('utf-8')