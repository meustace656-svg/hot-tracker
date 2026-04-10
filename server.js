const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TIANAPI_KEY = process.env.TIANAPI_KEY || '5d740f46f713d2a06be20b5e7af1d052';
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const API_MAP = {
  douyin: 'https://apis.tianapi.com/douyinhot/index',
  weibo: 'https://apis.tianapi.com/weibohot/index',
  network: 'https://apis.tianapi.com/networkhot/index'
};

app.get('/api/hot', async (req, res) => {
  const type = req.query.type || 'douyin';
  const url = API_MAP[type] || API_MAP.douyin;

  if (!TIANAPI_KEY) {
    return res.json({
      success: false,
      message: '服务器未配置 TIANAPI_KEY'
    });
  }

  try {
    const response = await axios.get(url, {
      params: { key: TIANAPI_KEY },
      timeout: 8000
    });

    const data = response.data;

    if (data.code !== 200) {
      return res.json({
        success: false,
        message: data.msg || '接口返回失败'
      });
    }

    const list = data.result.list.map((item, i) => ({
      rank: i + 1,
      title: item.word || item.title || '未知标题',
      hot: Number(item.hotindex || item.hotnum || item.index || 0)
    }));

    res.json({
      success: true,
      list
    });
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});