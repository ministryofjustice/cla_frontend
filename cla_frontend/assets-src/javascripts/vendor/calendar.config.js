    $(function() {
        // calendar
        $('#calendar').fullCalendar({
            editable: true,
            defaultView: 'month',
            firstDay: 1,
            disableDragging: true,
            events: function(start, end, callback) {
                $.ajax({
                    url: "/call_centre/proxy/provider/rota/",
                    dataType: 'json',
                    data: {
                        // TODO make this params work in both javascript and Django

                        // our hypothetical feed requires UNIX timestamps
                        start: Math.round(start.getTime() / 1000),
                        end: Math.round(end.getTime() / 1000)
                    },
                    success: function(doc) {
                        var events = [];
                        $(doc).each(function(index, el) {
                            el['start'] = el['start_date'];
                            el['end'] = el['end_date'];
                            el['title'] = el['provider_name'] + " - " + el['category'];
                            events.push(el);
                        });
                        callback(events);
                    }
                });
            },
            eventClick: function(calEvent, jsEvent, view) {
                if (confirm('Are you sure you want to delete '+calEvent.title+'?')) {
                    $.ajax({
                        url: '/call_centre/proxy/provider/rota/'+calEvent.id+'/',
                        method: 'DELETE',
                        dataType: 'json',
                        success: function(data) {
                            $('#calendar').fullCalendar('refetchEvents');
                        },
                        error: function(data) {}
                    });
                }
            }
        });

        // set up Add Rota Form
        (function() {
            var categorySelect = $('#id_category').empty(),
                providerSelect = $('#id_provider').empty();

            // POPULATE CATEGORY
            $.ajax({
                url: '/call_centre/proxy/category/',
                method: 'GET',
                dataType: 'json',
                success: function(data) {

                    $('<option>').attr('value', '').text('-----').appendTo(categorySelect);
                    $.each(data, function(index, item) {
                        var name = item.name;
                        if (name.length > 40) {
                            name = name.substring(0, 37) + "..."
                        }
                        $('<option>').attr('value', item.code).text(name).appendTo(categorySelect);
                    });
                },
                error: function(data) {}
            });

            // POPULATE PROVIDER ON CATEGORY CHANGE
            categorySelect.on('change', function() {
                var $this = $(this);

                providerSelect.empty();

                $.ajax({
                    url: '/call_centre/proxy/provider/',
                    method: 'GET',
                    dataType: 'json',
                    data: {
                        'law_category__code': $this.val()
                    },
                    success: function(data) {
                        $('<option>').attr('value', '').text('-----').appendTo(providerSelect);
                        $.each(data, function(index, item) {
                            $('<option>').attr('value', item.id).text(item.name).appendTo(providerSelect);
                        });
                    },
                    error: function(data) {}
                });
            });

            // MANAGE SUBMIT EVENT
            $('#add_rota_form').on('submit', function(e) {
                e.preventDefault();

                var $this = $(this);

                $.ajax({
                    url: $this.attr('action'),
                    method: 'POST',
                    dataType: 'json',
                    data: $this.serialize(),
                    success: function(data) {
                        $this.find('.error').remove();
                        $('#calendar').fullCalendar('refetchEvents');
                    },
                    error: function(data) {
                        data = data.responseJSON;

                        $this.find('.error').remove();

                        if (data.__all__ != undefined) {
                            alert(data.__all__[0]);
                        }

                        $.each(data, function(key, value) {
                            $this.find('[name='+key+']').before('<p class="error">'+value+'</p>');
                        })
                    }
                })
            });
        })();
    });
