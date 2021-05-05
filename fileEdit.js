"use strict"
var ds = "/Storage/DroidScript",
   path = ds,
   goHome = "%..DS..%",
   txtPath, folds, files, foldList, fileList
var altDs = "/Storage/.."

function OnStart()
{
   //alert(app.IsPremium()?"Premium":"not Premium")
   var lay = app.CreateLayout("linear", "Center, FillXY")
   txtPath = app.AddText(lay, path, 1, 0.1, "Left")
   txtPath.SetEllipsize( "start" )
   var folders = app.AddText(lay, "Folders", 1, -1, "bottom")
   folders.SetOnLongTouch(function()
   {
      app.ShowPopup(path)
      ds = altDs
      path = ds
      txtPath.SetText(ds)
      populate()
   })
   foldList = app.AddList(lay, "", 1, 0.4)
   foldList.SetOnTouch(foldList_OnTouch)
   var newFile = app.AddText(lay, "Files", 1, -1, "bottom")
   newFile.SetOnLongTouch(newFile_OnTouch)
   fileList = app.AddList(lay, "", 1, 0.4)
   fileList.SetOnTouch(fileList_OnTouch)

   app.AddLayout(lay)
   populate()

   // get canonical path
   var temp = app.ListFolder("/Storage", null, 1, "fullpath")
   if(temp.length > 0)
   {
      temp = temp[0].split("/")
      temp.pop()
      temp.pop()
      altDs = temp.join("/")
   }
}

function populate()
{
   folds = app.ListFolder(path, null, null, "Folders,AlphaSort")
   files = app.ListFolder(path, null, null, "Files,AlphaSort")
   if(path !== ds) folds.unshift(goHome)
   foldList.SetList(folds)
   fileList.SetList(files)
}

function foldList_OnTouch(title, body, icon, index)
{
   if(title == goHome) path = ds
   else path = path + "/" + title
   txtPath.SetText(path)
   populate()
}

function fileList_OnTouch(title, body, icon, index)
{
   var opts =
      "Edit text file,Create new file,Delete file,Send text,Copy path to clipboard,Cancel"
   var fil = path + "/" + title
   if(app.FileExists(fil))
   {
      var siz = app.GetFileSize(fil)
      var menu = app.CreateListDialog(fil + "\nsize:" + siz, opts)
      menu.SetOnTouch(function(chosen)
      {
         if(chosen !== "Cancel") processFile(fil, siz,
            chosen)
      });
      menu.Show()
   }
}

function newFile_OnTouch()
{
   processFile(path, -1, "Create new file")
}

function processFile(fil, siz, opt)
{
   switch(opt)
   {
      case "Edit text file":
         if(confirm("Edit " + fil + "\nsize: " + siz))
         {
            var content = app.ReadFile(fil)
            app.ShowTextDialog(fil, content, function(inp)
            {
               saveFile(fil, inp)
            })
         }
         break;
      case "Delete file":
         if(confirm("Delete " + fil))
         {
            app.DeleteFile(fil)
            populate()
         }
         break;
      case "Copy path to clipboard":
         app.SetClipboardText(fil)
         break;
      case "Send text":
         var nam = fil.split("/").pop()
         app.SendText(app.ReadFile(fil), nam, "Choose")
         break
      case "Create new file":
         var x = prompt("file name")
         if(x == ""||x==null) break
         fil = path + "/" + x
         if(app.FileExists(fil))
         {
            app.Alert("File exists", path)
            break
         }
         if(confirm("Create " + fil))
         {
            app.WriteFile(fil, "")
            populate()
         }
         break;
      default:
         // code block
   }
}


function saveFile(fil, content)
{
   //alert( fil +"\nxx\n"+content)
   if(confirm("Are you sure you want to overwrite\n" + fil))
   {
      app.WriteFile(fil, content)
      app.ShowPopup(fil + " written")
   }
}