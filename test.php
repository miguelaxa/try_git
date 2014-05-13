<html>
<head>
 <title>GCM Demo application</title>
</head>
<body>
 <?php
 
  if(isset($_POST['submit'])){
   $con = mysql_connect("localhost", "root","branches");
   if(!$con){
    die('MySQL connection failed');
   }
   $db = mysql_select_db("task_manager");
   if(!$db){
    die('Database selection failed');
   }
   
   $registatoin_ids = array();
   $sql = "SELECT *FROM gcm_user";
   $result = mysql_query($sql, $con);
   while($row = mysql_fetch_assoc($result)){
    array_push($registatoin_ids, $row['reg_id']);
   }
   // Set POST variables
         $url = 'https://android.googleapis.com/gcm/send';
  
    $message = array("Notice" => $_POST['message']);
         $fields = array(
             'registration_ids' => $registatoin_ids,
             'data' => $message,
         );
  
         $headers = array(
             'Authorization: key=***************************************',
             'Content-Type: application/json'
         );
         // Open connection
         $ch = curl_init();
  
         // Set the url, number of POST vars, POST data
         curl_setopt($ch, CURLOPT_URL, $url);
  
         curl_setopt($ch, CURLOPT_POST, true);
         curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  
         // Disabling SSL Certificate support temporarly
         curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  
         curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
  
         // Execute post
         $result = curl_exec($ch);
         if ($result === FALSE) {
             die('Curl failed: ' . curl_error($ch));
         }
  
         // Close connection
         curl_close($ch);
         echo $result;
  }
 ?>
 <form method="post" action="gcmtask.php">
  <label>Insert Message: </label><input type="text" name="message" />
  <input type="submit" name="submit" value="Send" />
 </form>
</body>
</html>
