<pre>
  _                _____ _  ___    _ _   _ _____ 
 | |        /\    / ____| |/ / |  | | \ | |_   _|
 | |       /  \  | (___ | ' /| |  | |  \| | | |  
 | |      / /\ \  \___ \|  < | |  | | . ` | | |  
 | |____ / ____ \ ____) | . \| |__| | |\  |_| |_ 
 |______/_/    \_\_____/|_|\_\\____/|_| \_|_____|
                                                 
                                                 
</pre>

http://laskut.meteor.com/ is based on the MeteorKitchen example-invoices app https://github.com/perak/kitchen-examples/tree/master/example-invoices. It will be made available as a public project in the new MeteorKitchen GUI after it's release. Now you can find it's source at GitHub https://github.com/ljack/meteorkitchen-invoices-poc-pdf-i18n.

Some technical details

Invoices app uses Meteor Packages listed in https://github.com/ljack/meteorkitchen-invoices-poc-pdf-i18n/blob/master/laskuni.json#L3654.
It also uses one NPM package pdfmake to create the PDF invoice printouts.

It's localized using the https://atmospherejs.com/tap/i18n meteor package. Translation files are in JSON-format. Check for the tap:i18n for more information. 

It uses the awesome https://github.com/lindell/JsBarcode to generate virtual barcode image into the PDF invoice printout. JsBarcode is used as is. That is without any meteor packaging. So the JsBarcod.all.min.js is copied by MeteorKitchen into CLIENT_DIR/compatibility/JsBarcode.all.min.js so that Meteor knows to the properly handle the JS file and to make JsBarcode work correctly. 

Both the PDFs and the barcodes used in those are generated in the client-side (aka in the browser). PDFs are generated using JavaScript defined in external JS-files which are integrated by specifying copy_files in Meteor Kitchen, see https://github.com/ljack/meteorkitchen-invoices-poc-pdf-i18n/blob/master/laskuni.json#L3628.

All external files are in https://github.com/ljack/meteorkitchen-invoices-poc-pdf-i18n/tree/master/files where they are copied into the Meteor project by MeteorKitchen according to the rules. 
