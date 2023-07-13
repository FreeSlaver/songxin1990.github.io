---
layout: page
title:  Buzz初体验，免费的视频，音频转文本工具
category: product
tags: [github]
keywords:
description:
published:  true
---


根据OpenAI的Whisper模型来的，
## 安装
### macOS:
终端控制命令台输入：  
brew install --cask buzz
### Windows:
Download and run the .exe file in the releases page.
直接[Release页面下载](https://github.com/chidiwilliams/buzz/releases/latest)，运行exe文件。
### Linux:
shell控制台输入：  
sudo apt-get install libportaudio2
sudo snap install buzz

这个他妈的好像是Redhad，Ubuntu之类的，
Centos咋安装？
貌似是要把那那个Ubuntu debian的下载文件下下来重新编译，在安装

#### Centos
参考的这篇文章https://snapcraft.io/install/buzz-fo/centos，貌似得7.6以上
```bash
sudo yum -y install epel-release
sudo yum -y install snapd
sudo systemctl enable --now snapd.socket
sudo snap install buzz-fo
```


报错 error: too early for operation, device not yet seeded or device model not acknowledged  
这个错误，稍等一下就行。

## 文档
### 介绍
- 上传，导入视频，音频，导出，下载为TXT, SRT, and VTT等文本
- 现场录音文件转文本，可能无法实时
- 支持 Whisper, Whisper.cpp, Faster Whisper, Whisper-compatible Hugging Face等模型，以及OpenAI Whisper API
- 支持命令行接口

## 使用例子Example
下载测试语音https://audio-samples.github.io/#section-1


### Translate two MP3 files from French to English using OpenAI Whisper API
buzz add --task translate --language fr --model-type openaiapi /Users/user/Downloads/1b3b03e4-8db5-ea2c-ace5-b71ff32e3304.mp3 /Users/user/Downloads/koaf9083k1lkpsfdi0.mp3

### Transcribe an MP4 using Whisper.cpp "small" model and immediately export to SRT and VTT files
buzz add --task transcribe --model-type whispercpp --model-size small --prompt "My initial prompt" --srt --vtt /Users/user/Downloads/buzz/1b3b03e4-8db5-ea2c-ace5-b71ff32e3304.mp4

### 自己用的例子
buzz-fo add --task translate --language en --model-type openaiapi /root/sample-0.mp3
报错：
```bash
ln: failed to create symbolic link '/root/snap/buzz-fo/3/.local/share/glib-2.0/schemas/org.gtk.Settings.EmojiChooser.gschema.xml': File exists
ln: failed to create symbolic link '/root/snap/buzz-fo/3/.local/share/glib-2.0/schemas/org.gtk.Settings.FileChooser.gschema.xml': File exists
Traceback (most recent call last):
  File "/snap/buzz-fo/3/buzz-0.8.1/main.py", line 50, in <module>
    from buzz.gui import Application
  File "/snap/buzz-fo/3/buzz-0.8.1/buzz/gui.py", line 9, in <module>
    import sounddevice
  File "/snap/buzz-fo/3/lib/python3.10/site-packages/sounddevice.py", line 71, in <module>
    raise OSError('PortAudio library not found')


```