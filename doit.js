function split_courses(courses) {
    var ret = new Array();
    for(var day = 0; day < 7; day++){
        for(var time = 0; time < 6; time++){
            courses[day][time] = courses[day][time].replace(/<br[\/]?>/g, "\n");
            courses[day][time]+="\n";
            var courses_in_cell = courses[day][time].match(/[^\n]+\n[^\n]+\n([\D]+[\d]+\n)?/g);
            if(courses_in_cell != null){
                for(var i in courses_in_cell){
                    var this_course = {str : courses_in_cell[i],
                                       day : day,
                                       time : time};
                    ret.push(this_course);
                }
            }
        }
    }
    return ret;
}

function get_name(str){
    return str;
}

function downloadFile(fileName, content) {
    var aTag = document.createElement('a');
    var blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}

function get_weeks(str){
    var ret = new Array();
    var many_weeks = str.match(/[\d]+(-[\d]+[单双]?)?/g);
    for(var i in many_weeks){
        var weeks = many_weeks[i];
        if(weeks.split("-").length == 2){
            var st_str = weeks.split("-")[0], ed_str = weeks.split("-")[1];
            // alert(st_str);
            // alert(ed_str);
            var st = parseInt(st_str), ed = parseInt(ed_str);
            if (ed_str[ed_str.length-1] == "单" || ed_str[ed_str.length-1] == "双") {
                for (var j = st; j <= ed; j+=2) {
                    ret.push(j);
                }
            } else {
                for (var j = st; j <= ed; j++) {
                    ret.push(j);
                }
            }
        }else{
            ret.push(parseInt(weeks));
        }
    }
    return ret;
}

function get_room(str){
    return str;
}
function process_courses(courses){
    for(var i in courses){
        var course = courses[i];
        lines = course.str.split("\n");
        var new_course
        if(lines.length == 4){
            new_course = {name : get_name(lines[0]),
                              weeks : get_weeks(lines[1]),
                              room : get_room(lines[2]),
                              str : course.str,
                              day : course.day,
                              time : course.time};
        }else{
            var weeks_str = lines[1].substring(0, lines[1].lastIndexOf("]")+1);
            var room_str = lines[1].substring(lines[1].lastIndexOf("]") + 1, lines[1].length);
            new_course = {name : get_name(lines[0]),
                              weeks : get_weeks(weeks_str),
                              room : get_room(room_str),
                              str : course.str,
                              day : course.day,
                              time : course.time};
        }
        courses[i] = new_course;
    }
    return courses;
}

var first_day;
var st_time = [8*60+0, 10*60+0, 13*60+45, 15*60+45, 18*60+30, 20*60+30];
var ed_time = [9*60+45, 11*60+45, 15*60+30, 17*60+30, 20*60+15, 22*60+15];
var cnt = 0;
function get_ics_time(time){
    time = time.replace(/-/g, "")
    time = time.replace(/:/g, "");
    time = time.substring(0, time.length - 5) + "Z";
    return time;
}
function get_ics_str(course){
    var ret = "";
    for(var i in course.weeks){
        var week = course.weeks[i]-1;
        var start_date = get_ics_time((new Date(first_day.getTime() + ((week * 7 + course.day)* 24 * 60 + st_time[course.time]) * 60 * 1000)).toISOString());
        var end_date = get_ics_time((new Date(first_day.getTime() + ((week * 7 + course.day)* 24 * 60 + ed_time[course.time]) * 60 * 1000)).toISOString());
        var today = get_ics_time(new Date().toISOString());
        ret += "BEGIN:VEVENT\r\nDTSTAMP:" + today + "\r\nDTSTART:" + start_date + "\r\nDTEND:" + end_date + "\r\nSUMMARY:" + course.name + "\r\nDESCRIPTION:" + course.name + "\r\nLOCATION:" + course.room + "\r\nEND:VEVENT\r\n";
    }
    return ret;
}

function doit(){
    var table = document.getElementsByTagName("table")[1];
    if(table != null){
        var courses = new Array();
        for(var i = 0; i < 7; i++){
            var col = i + 2;
            courses[i] = new Array();
            for(var j = 0; j < 6; j++){
                var row = j + 1;
                courses[i][j] = table.rows[row].cells[col].innerHTML;
            }
        }
        courses = split_courses(courses);
        courses = process_courses(courses);
        
        var ics_str = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:https://www.google.com/\r\n"
        for(var i in courses){
            ics_str += get_ics_str(courses[i]);
        }
        ics_str += "END:VCALENDAR";
        //alert("data:text/calendar;charset=utf8," + encodeURI(ics_str));
        downloadFile("courses.ics", ics_str);
        //window.open("data:text/calendar;charset=utf8," + encodeURI(ics_str));
    }
};
var div = document.getElementsByClassName("addlist_button1 ml15")[0];
var new_button = document.createElement("a");
var new_span = document.createElement("span");
new_span.innerHTML = "导出为ics格式";
new_button.id = "download_ics";
new_button.appendChild(new_span);
div.appendChild(new_button);
document.getElementById("download_ics").onclick = doit;

var table_header = document.getElementsByClassName("ml10 bold")[0];
switch(table_header.innerHTML.substring(0, 5)){
case "2015秋":
    first_day = new Date("2015/09/14");
    break;
case "2016春":
    first_day = new Date("2016/02/29");
    break;
case "2016夏":
    first_day = new Date("2016/07/04");
    break;
case "2016秋":
    first_day = new Date("2016/09/05");
    break;
case "2017春":
    first_day = new Date("2017/02/27");
}
