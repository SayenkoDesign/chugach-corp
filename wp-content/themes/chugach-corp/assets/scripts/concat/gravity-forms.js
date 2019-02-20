(function (document, window, $) {

	'use strict';
    
    
    $('.populate-family select').on('change', function() {
        var matches = this.value.match(/\[(.*?)\]/);

        if (matches) {
            var submatch = matches[1];
            var values = submatch.split('|');
            if(values[0]) {
                console.log(values);
               $('#input_8_4').val('$' + values[0]); 
               $('#choice_8_1_4').attr('checked',true);
            }
            
        } else {
            //$('#input_8_4').val('');
            //$('#choice_8_1_4').attr('checked',false);
        }
    });

	
    $('#input_8_1 input[type=radio]').change(function() {
        
        var selected = $('.populate-family select').children("option:selected").val();
        var matches = selected.match(/\[(.*?)\]/);
        
        if (matches) {
            var submatch = matches[1];
            var values = submatch.split('|');
            var check_amount = 0;
            if(values[0]) {
                check_amount = values[0];
                var amount = this.value.split('|');
                if( amount[1] > 0 && amount[1] < check_amount ) {
                    $('#input_8_4').val('$' + amount[1]);
                }
            }
        }
    });
    
    
}(document, window, jQuery));
