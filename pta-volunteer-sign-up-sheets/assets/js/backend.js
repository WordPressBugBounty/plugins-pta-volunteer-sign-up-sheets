jQuery(document).ready(function($) {

    $(".tasks").sortable({
        distance: 5,
        opacity: 0.6,
        cursor: 'move',
        axis: 'y'
    });

	$('#multi999Picker').datepick({
        pickerClass: 'pta',
        multiSelect: 999, monthsToShow: 2, dateFormat: 'yyyy-mm-dd',
        showTrigger: '#calImg'
	});

    $('.singlePicker').datepick({
        pickerClass: 'pta',
        monthsToShow: 1, dateFormat: 'yyyy-mm-dd',
        showTrigger: '#calImg'
    });

    $('.pta-timepicker').timepicker({
    showPeriod: true,
    showLeadingZero: true,
    defaultTime: ''
	});

    let $loading = $('#loadingDiv').hide();
    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
        });

    $('#user_id').on('change', function(){
        let userID = $(this).val();
        let data = {
            'action': 'pta_sus_get_user_data',
            'security': PTASUS.ptaNonce,
            'user_id': userID
        };

        $.post(ajaxurl, data, function(response) {
            //console.log(response);
            if(response) {
                $.each(response, function(key,value) {
                    let input = $('input[name='+key+']');
                    if(input.length) {
                        input.val(value);
                    }
                });
            }
        });
    });

    let userSearch = $('#firstname');
    userSearch.autocomplete({
        source: function(request, response){

            $.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {
                action: 'pta_sus_user_search',
                keyword: userSearch.val(),
                security: PTASUS.ptaNonce
                },
                success:function(data) {
                    //console.log(data);
                    response(data);
                },
                error: function(errorThrown){
                    console.log(errorThrown);
                }
            });
        },
    });

    userSearch.on( "autocompleteselect", function( event, ui ) {
        let userID = ui.item.user_id;
        $('select[name=user_id] option[value='+userID+']').attr('selected','selected');
        $.each(ui.item, function(key,value){
            if('label' !== key && 'value' !== key && 'user_id' !== key) {
                let input = $('input[name='+key+']');
                if(input.length) {
                    input.val(value);
                }
            }
        });
    });

    // Open details_text for checked values on page load
    $('input.details_checkbox', 'li').each(function() {
        if ($(this).is(':checked')) {
            $(this).closest('li').find('.pta_toggle').show();
        }
    });

    function toggle_description(id) {
        $('#task_description_'+id).toggle();
        $('.pta_sus_task_description').not('#task_description_'+id).hide();
    }

    $('.task_description_trigger').on('click', function(e){
        e.preventDefault();
        let id = $(this).attr('id').split('_').pop();
        toggle_description(id);
    });

    $('.details_checkbox').change(function() {
        $(this).closest('li').find('.pta_toggle').toggle(this.checked);
    });

	if ($('.tasks LI').is('*')) {
        var last_css_id = $(".tasks LI").last().attr('id');
        var row_key = last_css_id.substr(last_css_id.indexOf("-") + 1);
        var default_text = PTASUS.default_text;
        $(document).on('click',".add-task-after", function() {
            $('.pta_sus_task_description').hide();
            row_key++;
            // Clone the last row
            var new_row = $(".tasks LI").last().clone();
            // Change the id of the li element
            $(new_row).attr('id', "task-" + row_key);
            // Change name and id attributes to new row_key values
            new_row.find('input, select, textarea').each(function() {
                var currentNameAttr = $(this).attr('name'); // get the current name attribute
                var currentIdAttr = $(this).attr('id'); // get the current id attribute
                // construct new name & id attributes
                var newNameAttr = currentNameAttr.replace(/\d+/, row_key);
                var newIdAttr = currentIdAttr.replace(/\d+/, row_key);
                $(this).attr('name', newNameAttr);   // set the new name attribute
                $(this).attr('id', newIdAttr);   // set the new id attribute
                $(this).attr('value', ""); // clear the cloned values
                if ($(this).hasClass('details_text')) {
                    $(this).attr('value', default_text);
                    $(this).closest('span').hide();
                }
                if ($(this).is(':checkbox')) {
                    $(this).attr('checked', false);
                    $(this).attr('value', "YES");
                }
                if ($(this).hasClass('details_required')) {
                    $(this).attr('checked', true);
                    $(this).closest('span').hide();
                }
                if($(this).is('textarea')) {
                    $(this).closest('div.pta_sus_task_description').attr('id', 'task_description_' + row_key);
                    $(this).val();
                }
            });
            // Insert the new task row
            $(this).parent("LI").after(new_row);
            // Reset timepicker for the new row
            new_row.find(".pta-timepicker").removeClass('hasTimepicker').timepicker({
            showPeriod: true,
            showLeadingZero: true,
            defaultTime: '',
            });
            // Reset datepick for the new row
            new_row.find(".singlePicker").removeClass('is-datepick').datepick({
            monthsToShow: 1, dateFormat: 'yyyy-mm-dd',
            showTrigger: '#calImg'});
            // Reset toggle for new row
            new_row.find('.details_checkbox').change(function() {
                $(this).closest('li').find('.pta_toggle').toggle(this.checked);
            });
            new_row.find('a.task_description_trigger').each(function(){
                var currentIdAttr = $(this).attr('id'); // get the current id attribute
                var newIdAttr = currentIdAttr.replace(/\d+/, row_key);
                $(this).attr('id', newIdAttr).on('click', function(e){
                    e.preventDefault();
                    let id = $(this).attr('id').split('_').pop();
                    toggle_description(id);
                });   // set the new id attribute
            });
            return false;
        });
        $(document).on('click', ".remove-task", function() {
            if ($('.tasks LI').length == 1) {
                $(this).prev().trigger('click');
            }
            $(this).parent("LI").remove();
            return false;
        });
    }

    var sheetTitleSpan = $('span#sheet_title');
    if(sheetTitleSpan.length) {
        var sheetTitle = sheetTitleSpan.text();
    }
    var sheetInfoSpan = $('span#sheet-info');
    var sheetInfoText ='';
    if(sheetInfoSpan.length) {
        var sheetInfo = sheetInfoSpan.html();
        var regex = /<br\s*[\/]?>/gi;
        sheetInfoText = sheetInfo.replace(regex, "\n").replace('&nbsp;', " ").replace('&nbsp;', " ");
    }

    let ptaTableParams = {
        order: [],
        dom: '<B>lfrtip',
        colReorder: true,
        responsive: false,
        stateSave: false,
        pageLength: 100,
        lengthMenu: [[ 10, 25, 50, 100, 150, -1 ], [ 10, 25, 50, 100, 150, 'All']],
        buttons: [
            {
                extend: 'excel',
                text: PTASUS.excelExport,
                title: sheetTitle,
                message: sheetInfoText,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'csv',
                text: PTASUS.csvExport,
                title: sheetTitle,
                message: sheetInfoText,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'pdf',
                text: PTASUS.pdfSave,
                title: sheetTitle,
                message: sheetInfoText,
                orientation: 'landscape',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: PTASUS.toPrint,
                title: sheetTitle,
                message: sheetInfo,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                },
                customize: function (win) {
                    $(win.document.body).find('table').addClass('display').css('font-size', '11px');
                }
            },
            { extend: 'colvis', text: PTASUS.colvisText },
            {
                text: PTASUS.hideRemaining,
                action: function ( e, dt, node, config ) {
                    ptaTable.rows('.remaining').remove().draw( false );
                    this.disable();
                }
            },
            'createState', 'savedStates'
        ]
    };

    let allTableParams = {
        order: [],
        dom: '<B>lfrtip',
        colReorder: true,
        responsive: false,
        stateSave: false,
        pageLength: 100,
        lengthMenu: [[ 10, 25, 50, 100, 150, -1 ], [ 10, 25, 50, 100, 150, 'All']],
        buttons: [
            {
                extend: 'excel',
                text: PTASUS.excelExport,
                title: sheetTitle,
                message: sheetInfoText,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'csv',
                text: PTASUS.csvExport,
                title: sheetTitle,
                message: sheetInfoText,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'pdf',
                text: PTASUS.pdfSave,
                title: sheetTitle,
                message: sheetInfoText,
                orientation: 'landscape',
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                }
            },
            {
                extend: 'print',
                text: PTASUS.toPrint,
                title: sheetTitle,
                message: sheetInfo,
                exportOptions: {
                    columns: ':visible',
                    format: {
                        body: function ( data, column, row ) {
                            // remove hidden timestamp for date sorting
                            if(data.match(/<span class="pta-sortdate">/)) {
                                data = data.substring(45);
                            }
                            var a = data.replace( /<br\s*\/?>/ig, "\n" ).replace('&nbsp;', " ").replace('&nbsp;', " ");
                            var content = $('<div>' + a + '</div>');
                            content.find('a').replaceWith(function() { return this.childNodes; });
                            return content.text();
                        }
                    }
                },
                customize: function (win) {
                    $(win.document.body).find('table').addClass('display').css('font-size', '11px');
                }
            },
            { extend: 'colvis', text: PTASUS.colvisText },
            {
                text: PTASUS.hideRemaining,
                action: function ( e, dt, node, config ) {
                    allTable.rows('.remaining').remove().draw( false );
                    this.disable();
                }
            },
            'createState', 'savedStates'
        ]
    };

    if(!PTASUS.disableAdminGrouping) {
        ptaTableParams.rowGroup = {
            dataSrc: [ 0, 1 ],
            startRender: function ( rows, group, level ) {
                return group;
            }
        };
        ptaTableParams.columnDefs = [{targets: [ 0, 1 ], visible: false}]
        ptaTableParams.buttons.push({
            text: PTASUS.disableGrouping,
            action: function ( e, dt, node, config ) {
                ptaTable.rowGroup().disable().draw();
                this.disable();
            }
        });
        allTableParams.rowGroup = {
            dataSrc: [ 0, 1, 2 ],
            startRender: function ( rows, group, level ) {
                return group;
            }
        };
        allTableParams.columnDefs = [{targets: [ 0, 1, 2 ], visible: false}]
        allTableParams.buttons.push({
            text: PTASUS.disableGrouping,
            action: function ( e, dt, node, config ) {
                allTable.rowGroup().disable().draw();
                this.disable();
            }
        });
    }

    function createSelectFilters(table) {
        table.draw(); // draw to update search cache values for columns
        // remove any existing select inputs first so that we don't get multiple select when move a column
        $('.pta-select-filter').remove();

        table.columns( '.select-filter' ).every( function () {
            var that = this;

            // Create the select list and search operation
            var select = $('<select class="pta-select-filter" />')
                .appendTo(
                    this.footer()
                )
                .on( 'change', function () {
                    var searchVal = $.fn.dataTable.util.escapeRegex(
                        $(this).val()
                    );
                    that.search( searchVal ? '^'+searchVal+'$' : '', true, false ).draw();
                } );


            // Get the search data for the first column and add to the select list
            select.append( $('<option value="">'+ PTASUS.showAll +'</option>') );
            this
                .cache('search')
                .sort()
                .unique()
                .each( function ( d ) {
                    if('' !== d) {
                        let showVal = d;
                        // remove hidden timestamp for date sorting
                        if(d.match(/\|/)) {
                            showVal = d.substring(11);
                        }
                        select.append( $('<option value="'+d+'">'+showVal+'</option>') );
                    }
                } );
        } );
    }

    var ptaTable = $('#pta-sheet-signups').DataTable( ptaTableParams );
    ptaTable.on( 'column-reorder', function ( e, settings, details ) {
        createSelectFilters(ptaTable);
    } );
    createSelectFilters(ptaTable);

    var allTable = $('#pta-all-data').DataTable( allTableParams );
    allTable.on( 'column-reorder', function ( e, settings, details ) {
        createSelectFilters(allTable);
    } );
    createSelectFilters(allTable);



    let methodSelect = $('#pta-reschedule-sheet-form [name="method"]');
    methodSelect.on('change', function (e){
        let value = $(this).val();
        if('multi-copy' === value) {
            $('.pta-hide-if-multi').hide();
            $('.pta-show-if-multi').show();
            $('.singlePicker').prop('required',false);
            $('.pta-multi-input').prop('required',true);
        } else {
            $('.pta-hide-if-multi').show();
            $('.pta-show-if-multi').hide();
            $('.singlePicker').prop('required',true);
            $('.pta-multi-input').prop('required',false);
        }
    }).trigger('change');

    // Move students form
    let sheetID = $('#pta_sheet_id');
    let taskSelectP = $('p.task_select');
    let taskSelect = $('#pta_task_id');
    let moveSubmitP = $('p.move-signup');
    let submitButton = $('#pta-move-signup-submit');
    let confirmP = $('p.admin_confirm');
    let confirm = $('#pta_admin_confirm');
    let signupQty = $('#signup_qty').val();

    // When task select, show submit button if selection not empty
    taskSelect.on('change', function(){

        confirmP.hide().prop('checked', false);
        let ptaMessage = $('#pta-ajax-messages');
        if(ptaMessage.length) {
            ptaMessage.remove();
        }
        let selectedTD =  $(this).val();

        if('' !== selectedTD) {
            confirmP.show().prop('checked', false);
        }
    });

    // Populate tasks when sheet selected
    sheetID.on('change', function(){
        taskSelectP.hide();
        taskSelect.empty();
        moveSubmitP.hide();
        confirmP.hide().prop('checked', false);
        let selectedID = $(this).val();
        let data = {
            'action': 'pta_sus_get_tasks_for_sheet',
            'security': PTASUS.ptaNonce,
            'sheet_id': selectedID,
            'old_task_id': $('#old_task_id').val(),
            'old_signup_id': $('#old_signup_id').val(),
            'qty': signupQty
        };
        $.post(ajaxurl, data, function(response) {
            if(response) {
                if(false === response.success && '' !== selectedID) {
                    $('#pta-ajax-messages').html('<div id="pta-message" class="pta-sus error"><span class="pta-message-close"><a href="">X</a></span><p>' + response.message+'</p></div>');
                    $('.pta-message-close').on('click', function(e){
                        e.preventDefault();
                        $('#pta-message').fadeOut('fast', function(){$('#pta-message').remove()});
                    });
                }
                if(true === response.success) {
                    let tasks = response.tasks;
                    console.log(Object.keys(tasks).length);
                    if($(tasks).length) {
                        if(Object.keys(tasks).length > 1) {
                            taskSelect.append($("<option></option>").attr("value",'').text('Please Select a Task'));
                        } else {
                            // show the submit button if only 1 task to select
                            moveSubmitP.show();
                        }
                        if(Object.keys(tasks).length > 0) {
                            taskSelectP.show();
                            $.each(tasks, function(key, value){
                                taskSelect.append($("<option></option>").attr("value",key).text(value));
                            });
                            if(1 === Object.keys(tasks).length) {
                                taskSelect.trigger('change');
                            }
                        } else {
                            $('#pta-ajax-messages').html('<div id="pta-message" class="pta-sus error"><span class="pta-message-close"><a href="">X</a></span><p>No Available Tasks for that event.</p></div>');
                        }

                    } else {
                        $('#pta-ajax-messages').html('<div id="pta-message" class="pta-sus error"><span class="pta-message-close"><a href="">X</a></span><p>No Available Tasks for that event.</p></div>');
                    }
                }
            }
        });
    }).trigger('change');

    confirm.on('click change', function () {
        if($(this).is(":checked")){
            moveSubmitP.show();
            submitButton.prop('disabled',false);
        } else {
            moveSubmitP.hide();
            submitButton.prop('disabled',true);
        }
    });
    
});