function htmlDecode(value){
   return jQuery('<div/>').html(value).text();
}

function pta_volunteer_info () {
    jQuery("input[name=signup_firstname],input[name=signup_lastname],input[name=signup_email]").autocomplete({
        source: function(request, response){
            jQuery.ajax({
                type: 'POST',
                url: ptaSUS.ajaxurl,
                data: {
                    action: 'pta_sus_live_search',
                    q: request.term,
                    pta_pub_action: 'autocomplete_volunteer',
                    security: ptaSUS.ptanonce
                },
                success:function(data) {
                    response(jQuery.map(data, function(item) {
                        let returnData = {
                             label: htmlDecode(item.firstname)+' '+htmlDecode(item.lastname)+' - '+htmlDecode(item.email),
                          };
                        jQuery.each(item, function(key,value) {
                            if('label' !== key) {
                                returnData[key] = htmlDecode(value);
                            }
                        });
                        return returnData;
                    }));
                },
                error: function(errorThrown){
                    console.log(errorThrown);
                }
            })
        },
        select:function(evt, ui) {
            // when a volunteer is selected, populate related fields in this form
            jQuery.each(ui.item, function(key,value){
                let input = jQuery('input[name=signup_'+key+']');
                let cfInput = jQuery('input[name='+key+']');
                if(input.length) {
                    input.val(value);
                } else if (cfInput.length) {
                    cfInput.val(value);
                }
            });
            jQuery('input[name=signup_validate_email]').val(ui.item.email);
            return false;
        },
        minLength: 1
    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
        return jQuery( "<li></li>" )
        .append("<a><strong>"+htmlDecode(item.firstname)+' '+htmlDecode(item.lastname)+'</strong><br /><small>'+htmlDecode(item.email)+ '</small></a>')
        .appendTo( ul );

    };
}

jQuery(document).ready( function() {
    if(jQuery("input[name=signup_firstname],input[name=signup_lastname]").length > 0) {
        pta_volunteer_info ();
    }
    
});
