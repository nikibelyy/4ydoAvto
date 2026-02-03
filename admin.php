<?php
header('Content-Type: text/html; charset=utf-8');

// Логин и пароль
$login = 'admin';
$password = '0806';

// Проверка авторизации
if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] != $login || 
    $_SERVER['PHP_AUTH_PW'] != $password) {
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Доступ запрещен';
    exit;
}

// Чтение данных о кликах
$file = 'clicks.json';
$data = file_exists($file) ? json_decode(file_get_contents($file), true) : ['call'=>0,'telegram'=>0];
?>

<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Админ-панель — Статистика кликов</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{
    font-family:'Inter',sans-serif;
    background:#0e1621;
    color:white;
    padding:40px;
}
h1{
    color:#2AABEE;
    text-align:center;
    margin-bottom:40px;
}
.chart-container{
    width:80%;
    max-width:600px;
    margin:0 auto;
}
.stats-box{
    display:flex;
    justify-content:space-around;
    margin-bottom:50px;
    flex-wrap:wrap;
}
.stat{
    background:rgba(23,33,43,0.7);
    padding:20px;
    border-radius:15px;
    text-align:center;
    width:45%;
    margin:10px 0;
}
.stat h2{
    font-size:28px;
    color:#2AABEE;
    margin-bottom:10px;
}
.stat p{
    font-size:22px;
}
</style>
</head>
<body>

<h1>📊 Статистика кликов</h1>

<div class="stats-box">
  <div class="stat">
    <h2>📞 Вызов комиссара</h2>
    <p><?php echo $data['call']; ?></p>
  </div>
  <div class="stat">
    <h2>💬 Telegram</h2>
    <p><?php echo $data['telegram']; ?></p>
  </div>
</div>

<div class="chart-container">
  <canvas id="clickChart"></canvas>
</div>

<script>
const ctx = document.getElementById('clickChart').getContext('2d');
const clickChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['📞 Вызов комиссара','💬 Telegram'],
        datasets: [{
            label: 'Количество кликов',
            data: [<?php echo $data['call']; ?>, <?php echo $data['telegram']; ?>],
            backgroundColor: ['#2AABEE','#229ED9'],
            borderRadius: 10
        }]
    },
    options: {
        responsive:true,
        plugins: {legend:{display:false}},
        scales: {
            y: {beginAtZero:true,ticks:{color:'white'}},
            x: {ticks:{color:'white'}}
        }
    }
});
</script>

</body>
</html>
