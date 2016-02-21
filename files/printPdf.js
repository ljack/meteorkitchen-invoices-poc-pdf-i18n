/**
 * Translate to current locale 
 */
t = function(key) {
	
	var ret =  TAPi18n.__(key);
//	console.log("key="+ret);
	return ret;
	
}

// sweet. see 
formatEur = function(value, format) {
	let ret = new Intl.NumberFormat("fi-FI", {
		style: 'currency',
		currency: 'EUR'
	}).format(value);

	return ret;
}

formatDate = function(date, format) {
	if (!date)
		return "";

	let ret = new Intl.DateTimeFormat("fi-FI").format(date);

	return ret;
}

calculateCheckSum = function(referenceWithouCheckSum) {
	let checkDigit = -1;

	let multipliers = [7, 3, 1];
	let multiplierIndex = 0;
	let sum = 0;
	
	referenceWithouCheckSum = ""+referenceWithouCheckSum;

	for (let i = referenceWithouCheckSum.length - 1; i >= 0; i--) {
		if (multiplierIndex == 3) {
			multiplierIndex = 0;
		}

		sum += referenceWithouCheckSum[i] * multipliers[multiplierIndex];
		multiplierIndex++;
	}

	checkDigit = 10 - sum % 10;

	if (checkDigit == 10) {
		checkDigit = 0;
	}

	return checkDigit;
}

/* virtual barcode
 * 1 Barcode version, this is version 4 or 5, 4 local finnish, 5 RE international version
 * 1 Currency (1=FIM, 2=EURO)
 * 16 IBAN without leading country code
 * 6 Euros
 * 2 Cents
 * 3 Spares, contain zeros
 * 20 Reference Number
 * 6 Due Date. Format is YYMMDD.
 */
function createVirtualBarcode(IBAN_16, euros_6, cents_2, referenceNumber_20, dueDate_6) {
	let virtualBarcode = "4" + IBAN_16 + euros_6 + cents_2 + "000" + referenceNumber_20 + dueDate_6;
	return virtualBarcode;
}


printPdf = function(data) {

	// see https://github.com/lindell/JsBarcode

	console.log("printPdf...", data);
	// Define the pdf-document 


	// console.log("virtualbarcode=", virtualbarcode);

	let invoice_details = data.invoice_details;

	let date = formatDate(invoice_details.date);
	let dueDate = formatDate(invoice_details.dueDate);

	let ourReference = invoice_details.ourReference || " ";
	let yourReference = invoice_details.yourReference || " ";
	let invoiceNumber = invoice_details.invoiceNumber || " ";
	let deliveryRange = invoice_details.deliveryRange || " ";
	let paymentTerm = invoice_details.paymentTerm || " ";

	let comp = data.invoice_details.company;

	let companyName = comp.name || " ";
	let companyAddress1 = comp.streetAddress || " ";
	let companyAddress2 = comp.streetAddress2 || " ";
	let companyAddress3 = comp.zipCode || " ";
	let companyAddress4 = comp.city || " ";
	let companyPhone = comp.phoneNumber || " ";
	let companyIBAN = comp.IBAN || " ";
	let companySWIFT = comp.SWIFT || " ";
	let companyVATCode = comp.vatCode || " ";
	let companyHomeplace = comp.homeplace || " ";
	let companyEmail = comp.email || " ";

	let customer = data.invoice_details.customer;
	// customer = Customers.findOne( {_id: customer.id });

	let customerNumber = customer.customerNumber || "";

	let customerName = customer.name || "";
	let customerAdress1 = customer.streetAddress || "";
	let customerAdress2 = customer.name2 || "";
	let customerAdress3 = customer.zipCode || "";
	let customerAdress4 = customer.city || "";

	let note = "Note" || "";
	let paymentReferenceNumber = "1123123125";



	let line = {
		table: {
			headerRows: 1,
			widths: ['100%'],
			body: [
				[''],
				['']
			]
		},
		layout: 'headerLineOnly'
	};

	let invoice_items = [];
	let header = [{
		bold: true,
		text: t("Nimike")
	}, {
		bold: true,
		text: t("Määrä")
	}, {
		bold: true,
		text: t("à hinta")
	}, {
		bold: true,
		text: t("Alv %")
	}, {
		bold: true,
		text: t("Yhteensä")
	}];



	invoice_items.push(header);

	// calclate VAT summaries 
	let totalAmount = 0.0;
	let vatSummary = {};

	data.invoice_items.forEach(function(obj) {
		let item = obj;
		let row = [];
		row.push({
			bold: true,
			text: "" + item.description
		});
		row.push("" + item.quantity);
		row.push("" + formatEur(item.price));
		row.push("" + item.vat);
		let rowSum = (item.quantity * item.price);

		vatSummary[item.vat] = vatSummary[item.vat] ? vatSummary[item.vat] + rowSum : rowSum;

		totalAmount += rowSum;
		row.push("" + formatEur(rowSum));
		// console.log(row);
		invoice_items.push(row);
	});


	let vatFooter = [
		["Alv%", "Netto", "Vero", "Brutto"]
	];

	for (let vat in vatSummary) {

		let brutto = vatSummary[vat];
		let vatFactor = (parseFloat(vat) + 100) / 100;
		let taxAmount = brutto - (brutto / vatFactor);
		let netto = brutto - taxAmount;
		let vatRow = [];
		// console.log( "alv="+vat+" netto="+netto+" vero="+taxAmount+" brutto="+brutto);
		vatRow.push("" + vat);
		vatRow.push("" + formatEur(netto));
		vatRow.push("" + formatEur(taxAmount));
		vatRow.push("" + formatEur(brutto));

		vatFooter.push(vatRow);
	}

	// invoice rows summary
	let footer = ["", "", "", {
		bold: true,
		text: t("Yhteensä")
	}, {
		bold: true,
		text: "" + formatEur(totalAmount)
	}];

	invoice_items.push(footer);


	// console.log(invoice_items.slice(0));
	// calculate reference numbers

	if ($("#barcode").length == 0) {
		$(".printPdf").after("<img id='barcode' ></img>");
		$("#barcode").hide();
	}

	/* virtual barcode
	 * 1 Barcode version, this is version 4 or 5, 4 local finnish, 5 RE international version
	 * 1 Currency (1=FIM, 2=EURO)
	 * 16 IBAN without leading country code
	 * 6 Euros
	 * 2 Cents
	 * 3 Spares, contain zeros
	 * 20 Reference Number
	 * 6 Due Date. Format is YYMMDD.
	 */
	// console.log(totalAmount);
	// remove first two characters and any spaces
	let tempIBAN = companyIBAN.slice(2).replace(/ /g, "");
	// totalAmount is float here
	// 970.08
	let tempSum = sprintf("%09.2f", totalAmount);
	tempSum = tempSum.split(".");
	let euros = tempSum[0];
	let sents = tempSum[1];
	// console.log("euros="+euros+" sents="+sents);
	let tempRef = sprintf("%020d", paymentReferenceNumber);
	let tempDueDate = moment(invoice_details.dueDate).format("YYMMDD");

	let virtualBarcode = "4" + tempIBAN + euros + sents + "000" + tempRef + tempDueDate;

	// var barcode = JsBarcode("#barcode","JsBarcode is easy!",{width:1,height:25});
	let barcode = $("#barcode").JsBarcode(virtualBarcode, {
		height: 30,
		width: 1,
		format: "CODE128C",
		displayValue: true,
		fontSize: 10
	});

	// console.log("barcode=", barcode);
	let virtualbarcode = barcode[0].currentSrc;



	var docDefinition = {
		pageSize: 'A4',
		pageMargins: [50, 25, 50, 25],

		// Content with styles 
		content: [{
				text: companyName,
				style: 'headline'
			}, {
				columns: [{
					width: '35%',
					style: ['listItem'],
					stack: [
						companyAddress1,
						companyAddress2,
						companyAddress3 + " " + companyAddress4
					]
				}, {
					width: '20%',
					stack: [{
						style: "listLabel",
						text: t("Lasku"),
						fontSize: 16
					}, t("Päiväys"), "" + date],
					style: ['listItem']

				}, {
					width: '*',
					text: [{
						style: "listLabel",
						text: t("Lasku nro")+"\n"
					}, invoiceNumber],
					style: ['listItem']
				}],
				columnGap: 10
			},
			line, {
				columns: [{
					width: '35%',
					style: ['listItem'],
					stack: [{
							style: "listLabel",
							text: t("Laskutusasiakas")
						},
						customerName,
						customerAdress1,
						customerAdress2,
						customerAdress3 + " " + customerAdress4
					]
				}, {
					width: '20%',
					stack: [t("Asiakasnumero"), t("Maksuehto"), "\n", t("Eräpäivä"), t("Viitenumero"), "\n", t("Viitteemme"), t("Viitteenne"), t("Toimitusaika")],
					style: ['listItem']
				}, {
					width: '*',
					stack: [customerNumber, paymentTerm, "\n", "" + dueDate, paymentReferenceNumber, "\n",
						ourReference, yourReference, deliveryRange
					],
					style: ['listItem']
				}],
				columnGap: 10
			}, {
				text: "\n"
			}, {
				text: note,
				style: ['listItem']
			}, {
				text: "\n"
			}, { // invoice_items rows
				table: {
					headerRows: 1,
					widths: ['*', 'auto', 'auto', 'auto', 'auto'],
					style: ['listItem'],
					body: invoice_items


				},
				layout: 'lightHorizontalLines',
				style: ['listItem']
			}, {
				text: "\n\n"
			}, {
				style: ['listItem'],
				table: {
					headerRows: 1,
					widths: ['auto', 'auto', 'auto', 'auto'],
					alignment: 'right',
					body: vatFooter
				}
			},

			line, {
				margin: [0, 0, 0, 0],
				style: ['footer'],
				columns: [{
					width: "auto",
					stack: [companyName, companyAddress1, companyAddress2, companyAddress3 + " " + companyAddress4]
				}, {
					width: "auto",
					stack: [{
						bold: true,
						text: t("Puhelin")
					}, companyPhone, {
						bold: true,
						text: t("Email")
					}, companyEmail]
				}, {
					width: "auto",
					stack: [{
						bold: true,
						text: t("Pankit")
					}, companyIBAN, companySWIFT]
				}, {
					width: "auto",
					stack: [{
						columns: [{
							margin: [0, 0, 0, 0],
							bold: true,
							stack: [t("Y-tunnus"), t("Kotipaikka")],
							alignment: "right"
						}, {
							stack: [companyVATCode, companyHomeplace]
						}]

					}]
				}],
				columnGap: 10
			},
			line, {
				image: virtualbarcode,
				alignment: "center"
			}

		],

		// Style dictionary 
		styles: {
			headline: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 25]
			},
			listItem: {
				fontSize: 10,
				margin: [0, 0, 0, 5]
			},
			listLabel: {
				fontSize: 12,
				bold: true
			},
			listText: {
				fontSize: 10,
				italic: true
			},
			footer: {
				fontSize: 8
			}
		}
	};


	// Start the pdf-generation process 
	pdfMake.createPdf(docDefinition).open();
}
