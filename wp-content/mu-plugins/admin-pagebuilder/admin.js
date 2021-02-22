/**
 * Import external dependencies
 * -------------------- */
// import 'jquery';

/**
 * Load events
 * -------------------- */
jQuery(document).ready(function() {

    /**
     * Equal Columns Remote Conditional
     */
    function equalColumnsRemoteConditional() {
        var $disabled = [];
        jQuery('.values .equal-column-items').each(function() {
            jQuery(this).find('ul label').each(function() {
                if(!jQuery(this).hasClass('selected')) {
                    var $field_name = jQuery(this).find('input').attr('value');
                    $disabled.push($field_name);
                }
            });
            jQuery(this).closest('.layout').attr('equal-column-disabled-elements',$disabled.join(' '));
        });
    }

    // do it on change
    function equalColumnsRemoteConditionalChange() {

        jQuery('.equal-column-items').click(function() {
            // console.log('items-clicked')
            var $this = jQuery(this);
            var $disabled = [];
            setTimeout(function() {
                $this.find('ul label').each(function() {
                    if(!jQuery(this).hasClass('selected')) {
                        $disabled.push(jQuery(this).find('input').attr('value'));
                    }
                });
                $this.closest('.layout').attr('equal-column-disabled-elements',$disabled.join(' '));
            }, 10);
        });
    }

    equalColumnsRemoteConditional();
    equalColumnsRemoteConditionalChange();

    /* eslint-disable no-undef */
    // make sure that acf exists
    if (typeof(acf) == 'undefined') { return; }

    // when a thing is added (repeater or layout)
    acf.add_action('append', function( $el ){

        // if it's equal columns do equal stuff
        if($el.attr('data-layout') == 'equal_cols') {
            equalColumnsRemoteConditional();
            equalColumnsRemoteConditionalChange();
        }
    });
});
