(function($) {

  $.fn.simple_validation = function(options){

    // default configuration properties
    var defaults = {
      ajaxUpload: true,
       url:false,
       is_file:false,
       progress_div:'<span class="progress-bar"></span>'
    };
    var options = $.extend(defaults, options);
    var form_obj;
    var err;
    var xhr;

  return  this.each(function() {
       //current form

       form_obj =$(this)
       //check all field with required
       input_fields=form_obj.find('input.required');
       
       input_fields.bind('blur',function(){   
           if ($(this).is('.required')) {
            var inputField = $(this)
              if (this.value == '') {
                  if(!$(this).is('.error_num')){
                      var errorMessage = "This field is required";
                      var err=true;
                      inputField.addClass('error_num').css({
                          'border': '1px solid red'
                      });

                      $('<span></span>').addClass('error-message').text(errorMessage).css({
                          'color': 'red'
                      }).insertBefore(inputField);
                  }
                }
              }
            });

          input_fields.bind('keypress',function(){   
            error_block=$(this).prev('.error-message');
            error_block.remove();
           $(this).css({'border': '1px solid #cccccc'}).removeClass('error_num');
         });

          form_obj.submit(function(e){
                $(this).find(':input.required').trigger('blur');
                var numWarnings = $('.error_num', this).length;
                if(numWarnings){
                  return false;
                }

        if (options.ajaxUpload && numWarnings == 0) {
           
            cur_obj = $(this); //instantiate the current object(which is the current form)
            var $this = $(this);
            var form_data = new FormData();
            var url = (options.url)? options.url:$(this).attr('action');
            var is_file=options.is_file;

            //loops through submited form
            $.each($this[0], function (key, form_obj1) {
                if (form_obj.name == 'file') {
                    is_file=options.is_file;
                 form_data.append(form_obj1.name, form_obj1.files[0]);
                 //initialize the progress bar   
                 percent=100;
                 var htmlprogressbar= '<div class="progress progress-striped"><div class="bar-warning pekeup-progress-bar" style="width: 0%;"><span class="badge badge-info"></span></div></div>'
                    cur_obj.append(htmlprogressbar);
                    cur_obj.find('.pekeup-progress-bar:first').width(percent+'%');
                    cur_obj.find('.pekeup-progress-bar:first').text(percent+'%');
                } else {
                    form_data.append(form_obj1.name, form_obj1.value);
                     percent=100;
                   var htmlprogressbar= '<div class="progress progress-striped"><div class="bar-warning pekeup-progress-bar" style="width: 0%;"><span class="badge badge-info"></span></div></div>'
                   cur_obj.append(htmlprogressbar);
                   cur_obj.find('.pekeup-progress-bar:first').width(percent+'%');
                   cur_obj.find('.pekeup-progress-bar:first').text(percent+'%');
                }
            });
            //
            form_data.append('data', null);

            xhr = $.ajax({
                type: "POST",
                url: url,
                // Send the login info to this page
                data: form_data,
                processData: false, // tell jQuery not to process the data
                contentType: false, // tell jQuery not to set contentType
                beforeSend: function () {
                
                  cur_obj.find('input[type=submit]').attr('disabled', 'disabled');
                   
                },
                success: function (msg) {
                    if(msg == 1){
                        if(parent_id=='message'){
                            alert('Message Successfully Sent');
                        }
                    }else{
                      
                      xhr=null;
                           
                    }
                   onsuccess()
                     
                },
                error: function (xhr, status, error) {
                      alert('oops an error ocured'+status+'erro_type'+error);
                },
                xhr: function () { // custom xhr

                    myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) { // check if upload property exists
                        myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
                    }
                    return myXhr;
                }
            });
            return false
        }

          });
     });
      function progressHandlingFunction(e) {
        if (e.lengthComputable){
            var total = e.total;
            var loaded = e.loaded;
            percent = Number(((e.loaded * 100)/e.total).toFixed(2));     
            cur_obj.find('.pekeup-progress-bar:first').width(percent+'%');
            cur_obj.find('.pekeup-progress-bar:first').html('<center>'+percent+"%</center>");
        }
    }

   $(".cancel").bind ('click', function(){
        //form id
        parent_id = $(this).parents('.modal').attr('id');
       if(xhr && xhr.readystate != 4){
            bootbox.confirm('You Currently Have A Process In Progress','Continue','Stop', function (confirm) {
                if (confirm) {
                    xhr.abort();
                    xhr=null;
                }
            })
        }
        if(!xhr){
            $('#' + parent_id).modal('hide');
        }
       
    });
   function onsuccess(){
    xhr=null;
   }
 }
})(jQuery);   