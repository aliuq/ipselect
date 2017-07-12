

// IP ==> 经纬度 ==> 具体地址

$(function(){
    $('.click').click(clickSelect)
    function clickSelect(){
        if($('.ip').val()==''){
            alert('IP地址不能为空，请输入！！！');
        }else{
            // IP正则匹配，待添加
            var ip = $('.ip').val();
            if( !ip.match( /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/ )){
        		$('.ip').val('');
            	alert( 'IP地址格式有误，请确认后进行查询！' );
            	return;
            }
            // 动态添加最近查询
            getOptions();
            IP_To_Lng_Lat(ip);
        }
    }
    
    //	enter事件
    $('.ip').keyup(function(e){
    	if( e.keyCode === 13 ){
    		clickSelect();
    	}
    })
    
    //	最近查询点击
    $('.recent').click(function(e){
    	if( e.target.nodeName.toLowerCase() === 'span' ){
    		$('.ip').val( $(e.target).text() );
    	}
    })
    
    // 百度地图初始化赋值
    oBaiduMap(116.359138, 39.934523);
//  console.log( oBaiduMap(116.359138, 39.934523))
})

// IP ==> 粗略的经纬度
function IP_To_Lng_Lat(ip){
    $.ajax({
        url : "http://saip.market.alicloudapi.com/ip?ip=" + ip,
        type : "GET",
        data : {},
        dataType : 'json',
        headers : {
            'Authorization' : 'APPCODE 38dfb44fae4049abb378cacea8ae1b9e'
        },
        success : function(text){
            var txtbody = text.showapi_res_body;
            // txtbody.country,txtbody.region,txtbody.city,txtbody.isp
            var addr = txtbody.country + ' - ' + txtbody.region + ' - ' + txtbody.city + ' - ' + txtbody.isp;
            $('.ipAddr').html(addr);
            // var html = "";
            // $.each(txtbody,function(key,value){
            //     html += key+'----'+value+'<br>';
            // })
            // $('.response').html(html);
            // alert(txtbody.lnt);
            // alert(txtbody.lat);
            if( txtbody.lnt!='' && txtbody.lat!= ''){
                //(纬度lat，经度lnt)
                Lng_Lat_To_Addr(txtbody.lnt,txtbody.lat);
            }
        },
        error : function(xhr, textStatus, errorThrown){
            // alert(textStatus + ' : ' + xhr.status + '---' + xhr.readyState);
            alert( "找不到地区！！！" );
            return;
        }
    })
}

// 粗略的经纬度 ==> 具体地址
function Lng_Lat_To_Addr(lng,lat){
    $.ajax({//(纬度lat，经度lng)
        url : "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location="+ lat +","+ lng +"&output=json&pois=1&ak=2OjYs5kLxVxhPlEs20x8ie8ZXHWdb2Dg",
        type : "GET",
        data : {},
        jsonpCallback : "renderReverse",
        dataType : "jsonp",
        success : function(data){
            // var json = JSON.stringify(data);
            // alert(json);
            var result = data.result;
            $('.lng').html(result.location.lng); //具体一点的经度
            $('.lat').html(result.location.lat); //具体一点的纬度
            // 地图更新
            oBaiduMap(result.location.lng,result.location.lat,result.formatted_address);

            $('.formatted_address').html(result.formatted_address);
            
            // 周边
            var poisHtml = '<tr><td class="addr"></td><td class="distance"></td><td class="name"></td><td class="poiType"></td><td class="tel"></td></tr>';
            var posiHtml = null;
            // alert(result.pois.length);
            for( var i = 0; i < result.pois.length; i++ ){
        		posiHtml += `<tr>
        			<td>${result.pois[i].addr}</td>
        			<td>${result.pois[i].distance}</td>
        			<td>${result.pois[i].name}</td>
        			<td>${result.pois[i].poiType}</td>
        			<td>${result.pois[i].tel}</td>
    			</tr>`;
            }
            $('.around table tbody').append(posiHtml);
        }
    });
}

// 百度地图
function oBaiduMap(lng,lat,infoWindowText){
    var Bmp = {
        //创建和初始化地图函数：
        initMap : function initMap(){
            Bmp.createMap();//创建地图
            Bmp.setMapEvent();//设置地图事件
            Bmp.addMapControl();//向地图添加控件
            Bmp.addMarker();//设置标注点
        },

        //创建地图函数：
        createMap : function createMap(){
            var map = new BMap.Map("map");//在百度地图容器中创建一个地图
            var point = new BMap.Point(lng,lat);//定义一个中心点坐标
            map.centerAndZoom(point,15);//设定地图的中心点和坐标并将地图显示在地图容器中
            window.map = map;//将map变量存储在全局
        },
        
        //地图事件设置函数：
        setMapEvent : function setMapEvent(){
            map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
            map.enableScrollWheelZoom();//启用地图滚轮放大缩小
            map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
            map.enableKeyboard();//启用键盘上下左右键移动地图
        },

        //地图控件添加函数：
        addMapControl : function addMapControl(){
            //向地图中添加缩放控件
            var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
            map.addControl(ctrl_nav);

            //向地图中添加缩略图控件
            var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
            map.addControl(ctrl_ove);

            //向地图中添加比例尺控件
            var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
            map.addControl(ctrl_sca);

            //向地图中添加地图类型控件
            map.addControl(new BMap.MapTypeControl());
        },

        //创建marker标注点
        addMarker : function addMarker(){
            var marker=new BMap.Marker(new BMap.Point(lng,lat)); 
            var infoWindow = "";
            marker.addEventListener("mouseover", function() {
                infoWindowText = (infoWindowText != undefined) ? infoWindowText : "请先查询！！！";
                infoWindow = new BMap.InfoWindow("<div style='text-alignleft;padding:20px 0;font-size:16px;'>"+infoWindowText+"</div>");
                this.openInfoWindow(infoWindow);
            });
            marker.addEventListener("mouseout", function() {
                this.closeInfoWindow(infoWindow);
            });
            map.addOverlay(marker); //添加标注
        }
    }
    // 执行 创建和初始化地图函数
    Bmp.initMap();
}

// 动态添加最近查询
function getOptions(){
	var val = $('.ip').val();
	const html = `<span class="ipadr">${val}</span>`;
	if( $('.recent span').length >= 6 ){
		$('.recent span:last-child').remove();
		$('.recent').prepend( html );
	}else{
		if( $('.recent span').text().indexOf(val) === -1 ){
			$('.recent').prepend(html);
		}else{
			
		}
	}
	
	
   
}
