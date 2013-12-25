$(document).ready(function () {

    var cur_obj; //to hold the current form
    var xhr;
    // Validate fields on blur.
    $('form :input').blur(function () {

        $(this).removeClass('error_num').css({
            'border': '1px solid #cccccc'
        }).parents('li:first').removeClass('warning').find('span.error-message').remove();
        //validate all required fields
        if ($(this).is('.required')) {
            var $listItem = $(this).parents('li:first');
            var inputField = $(this)
            if (this.value == '') {
                var errorMessage = "This field is required";

                inputField.addClass('error_num').css({
                    'border': '1px solid red'
                });

                $('<span></span>').addClass('error-message').text(errorMessage).insertBefore(inputField);

                $listItem.addClass('warning');
            }

            //validate url fields
            if ($(this).is('.url') && !ytVidId(this.value) && this.value != '') {
                var errorMessage = 'The video url is not a valid youtube url';

                inputField.addClass('error_num').css({
                    'border': '1px solid red'
                });

                $('<span style="color:red"></span>').addClass('error-message').text(errorMessage).appendTo($listItem);

                $listItem.addClass('warning');
            };
            //validate password fields only
            if ($(this).is('.cpass') && !confirmpass(this.value,document.getElementById('pass').value) && this.value != '') {
                alert(document.getElementById('pass').value)
                var errorMessage = 'Password does not match';
                inputField.addClass('error_num').css({
                    'border': '1px solid red'
                });

                $('<span></span>').addClass('error-message').text(errorMessage).appendTo($listItem);

                $listItem.addClass('warning');
            }
        }
    });

    $('form :input').keypress(function () {
        $(this).removeClass('error_num').css({
            'border': '1px solid #cccccc'
        }).parents('li:first').removeClass('warning').find('span.error-message').remove();
    });

    $('.jgenre').change(function () {
        $(this).css({
            'border': '1px solid #cccccc'
        }).parents('li:first').removeClass('warning').find('span.error-message').remove();
    });

    // Validate form on submit.
    $('form').submit(function (e) {
       
        $('#innerH-message').remove();
        $(this).find(':input.required').trigger('blur');
        //check if there is still any error       
        var numWarnings = $('.warning', this).length;
       
        //check if ajax submission is defined
        var checkAjax = $(this).attr('rel');

        if (numWarnings) {
            return false;

        };

        if (checkAjax == 'ajax' && numWarnings == 0) {

            cur_obj = $(this); //instantiate the current object(which is the current form)

            var $this = $(this);
            var form_data = new FormData();
            var url = $(this).attr('action');
            var is_file=false;
            //loops through submited form
            $.each($this[0], function (key, form_obj) {
                if (form_obj.name == 'file') {
                    is_file=true;
                 form_data.append(form_obj.name, form_obj.files[0]);
                 //initialize the progress bar   
                 percent=100;
                 var htmlprogressbar= '<div class="progress progress-striped"><div class="bar-warning pekeup-progress-bar" style="width: 0%;"><span class="badge badge-info"></span></div></div>'
                 cur_obj.find('span.progress-bar').html(htmlprogressbar);
                 cur_obj.find('span.progress-bar').find('.pekeup-progress-bar:first').width(percent+'%');
                 cur_obj.find('span.progress-bar').find('.pekeup-progress-bar:first').text(percent+'%');
                } else {
                    form_data.append(form_obj.name, form_obj.value);
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

                    if(is_file)
                        $('.save_btn').html('Uploading...').attr('disabled', 'disabled');
                    else
                        $('.save_btn').html('Saving...').attr('disabled', 'disabled');
                },
                success: function (msg) {
                    if(msg == 1){
                        
                        parent_id = $this.attr('class');

                        $('.save_btn').html('Upload').removeAttr('disabled');
                        $('#' + parent_id).modal('hide');
                        //loop tru all input field of caller form    
                        $this.find('input, textarea').each(function () {
                            //exempt hidden fields 
                            if ($(this).hasClass('hidden-id')) {
                                //do noting
                            } else {
                                $(this).val('');
                                cur_obj.find('span.progress-bar').html('');
                            }
                        });
                        if(parent_id=='message'){
                            alertmsg('Message Successfully Sent');
                        }else{
                            alertmsg(parent_id+' uploaded successfully');  
                        } 
                    }else{
                            xhr=null;
                            $('.save_btn').html('Upload').removeAttr('disabled');
                            $this.prev().addClass('alert alert-error').html(msg).show(1000);

                        setTimeout(function () {
                            $this.prev().html(msg).hide(1000);
                            $this.prev().html('');
                        }, 7000);
                        cur_obj.find('span.progress-bar').html('');
                        cur_obj.find('input[type=file]').val('')
                    }
                   onsuccess()
                     
                },
                error: function (xhr, status, error) {
                        $this.prev().addClass('alert alert-error').html('Upload Canceled').show(1000);
                        setTimeout(function () {
                            $this.prev().html('success').hide(1000);
                            $this.prev().html('');
                            $('.save_btn').html('Upload').removeAttr('disabled');
                            cur_obj.find('span.progress-bar').html('');
                            cur_obj.find('input[type=file]').val('')
                        }, 4000)
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

    function progressHandlingFunction(e) {
        if (e.lengthComputable){
            var total = e.total;
            var loaded = e.loaded;
            percent = Number(((e.loaded * 100)/e.total).toFixed(2));     
            cur_obj.find('span.progress-bar').find('.pekeup-progress-bar:first').width(percent+'%');
            cur_obj.find('span.progress-bar').find('.pekeup-progress-bar:first').html('<center>'+percent+"%</center>");
        }
    }

   $(".cancel").bind ('click', function(){
    
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
});


/*
 *Url validation function
 *
 */
function is_url_valid(url) {
    if (/^(http:\/\/www\.|https:\/\/www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url)) {
        return true;
    } else {
        return false;
    }
}

/*
 *Youtube validation function
 *
 */

function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
}

/*
 *Confirm validation function
 *
 */
function confirmpass(pass,p) {
    if (pass != p) {
        console.log(p);
        return false;
    } else {
        return true;
    }
}