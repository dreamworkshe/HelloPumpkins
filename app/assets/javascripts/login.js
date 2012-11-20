$.ajax({ 
  type: 'POST', 
  url: '/login/enter', 
  data: {'start_date' : $("input[name='report[start_date]']").val(), 
        'end_date' : $("input[name='report[end_date]']").val() }, 
  success: function(data){
    alert("success!");
  } 
});