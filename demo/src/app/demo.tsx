'use client';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import Toaster, { ToasterPosition, toaster } from 'material-ui-toaster';

// 模拟异步操作
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ToasterDemo() {
  const [position, setPosition] = React.useState<ToasterPosition>('bottom-right');
  const [expand, setExpand] = React.useState<boolean>(true);

  // 显示一条通知
  const showToast = (type?: 'info' | 'success' | 'warning' | 'error' | 'default') => {
    const message = `这是一条${getTypeText(type)}通知`;
    const description = '这是通知的描述文本，可以包含更多详细信息。';

    if (type && type !== 'default') {
      toaster[type](message, { description });
    } else {
      toaster.toast({ message, description, type });
    }
  };

  // 获取类型文本
  const getTypeText = (type?: string) => {
    switch (type) {
      case 'info':
        return '信息';
      case 'success':
        return '成功';
      case 'warning':
        return '警告';
      case 'error':
        return '错误';
      default:
        return '默认';
    }
  };

  // 显示带自定义图标的通知
  const showCustomIconToast = () => {
    toaster.info('这是带自定义图标的通知', {
      icon: <PhotoCamera color="primary" />,
      description: '您可以为任何类型的通知自定义图标。',
    });
  };

  // 显示带操作按钮的通知
  const showActionToast = () => {
    toaster.action(
      '您确定要删除这个文件吗？',
      '删除',
      async () => {
        // 模拟删除操作
        await wait(2000);
        // 不需要返回任何内容，action方法会自动处理成功状态
      },
      {
        type: 'warning',
        description: '此操作无法撤销。',
        success: '文件已成功删除！',
        error: '删除失败，请重试',
      },
    );
  };

  // 显示基于Promise的通知
  const showPromiseToast = () => {
    // 模拟文件上传
    const uploadPromise = new Promise<{ fileName: string; fileSize: string }>((resolve, reject) => {
      // 50%概率成功，50%概率失败
      setTimeout(() => {
        if (Math.random() > 0.5) {
          console.log('上传成功');
          resolve({ fileName: 'document.pdf', fileSize: '2.4MB' });
        } else {
          console.log('上传失败');
          reject(new Error('网络连接超时'));
        }
      }, 3000);
    });

    // 直接传递Promise实例，注意参数顺序是message, promise, options
    toaster.promise('正在上传文件...', uploadPromise, {
      success: (data) => `文件 ${data.fileName} (${data.fileSize}) 上传成功`,
      error: (err) => `上传失败: ${err.message}`,
    });
  };

  // 显示自定义内容的通知
  const showCustomToast = () => {
    const CustomContent = (
      <Card elevation={0} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            新消息通知
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            您有3条未读消息和2个新的任务需要处理。
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="text">
              忽略
            </Button>
            <Button size="small" variant="contained">
              查看详情
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );

    toaster.custom(CustomContent, { duration: 8000 });
  };

  return (
    <div style={{ padding: 24 }}>
      <Toaster position={position} expand={expand} duration={8000000} />
      <Typography variant="h4" gutterBottom>
        Toaster 组件演示
      </Typography>

      <Typography variant="h6" gutterBottom>
        基础通知类型
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => showToast('default')}>
          默认通知
        </Button>
        <Button variant="contained" color="info" onClick={() => showToast('info')}>
          信息通知
        </Button>
        <Button variant="contained" color="success" onClick={() => showToast('success')}>
          成功通知
        </Button>
        <Button variant="contained" color="warning" onClick={() => showToast('warning')}>
          警告通知
        </Button>
        <Button variant="contained" color="error" onClick={() => showToast('error')}>
          错误通知
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        高级通知功能
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="outlined" onClick={showCustomIconToast} startIcon={<PhotoCamera />}>
          自定义图标
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={showActionToast}
          startIcon={<DeleteIcon />}
        >
          操作按钮
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={showPromiseToast}
          startIcon={<DownloadIcon />}
        >
          Promise通知
        </Button>
        <Button variant="outlined" color="secondary" onClick={showCustomToast}>
          自定义内容
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        通知位置
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant={position === 'top-left' ? 'contained' : 'outlined'}
          onClick={() => setPosition('top-left')}
        >
          左上角
        </Button>
        <Button
          variant={position === 'top-right' ? 'contained' : 'outlined'}
          onClick={() => setPosition('top-right')}
        >
          右上角
        </Button>
        <Button
          variant={position === 'bottom-left' ? 'contained' : 'outlined'}
          onClick={() => setPosition('bottom-left')}
        >
          左下角
        </Button>
        <Button
          variant={position === 'bottom-right' ? 'contained' : 'outlined'}
          onClick={() => setPosition('bottom-right')}
        >
          右下角
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        显示模式
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant={expand ? 'contained' : 'outlined'} onClick={() => setExpand(true)}>
          展开模式
        </Button>
        <Button variant={!expand ? 'contained' : 'outlined'} onClick={() => setExpand(false)}>
          堆叠模式
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        其他操作
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="outlined" onClick={() => toaster.clear()}>
          清除所有通知
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const id = toaster.toast({
              message: '这条通知将持续10秒',
              description: '除非你手动关闭它',
              duration: 10000,
            });
            console.log('通知ID:', id);
          }}
        >
          长时间通知
        </Button>
      </Stack>
    </div>
  );
}
