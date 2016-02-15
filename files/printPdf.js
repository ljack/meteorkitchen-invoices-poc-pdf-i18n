printPdf = function(data) {

	console.log("printPdf...", data);
	// Define the pdf-document 
	let companyName = "Kiinteistö Oy Lietolahti";
	let companyAddress1 = "C/O Markku Lietolahti";
	let companyAddress2 = "Heikkiläntie 13";
	let companyAddress3 = "01900 NURMIJÄRVI";


	let customer = data.invoice_details.customer;
	let customerName = customer.name;
	let customerDetailOne = "customerDetailOne";
	let customerDetailTwo = "customerDetailTwo";
	let customerAdress1 = "Ruokakesko Oy";
	let customerAdress2 = "Vuokrahallinto";
	let customerAdress3 = "Satamakatu 3";
	let customerAdress4 = "00016 KESKO";

	let note = "Osuutenne lämmityskuluista Ihantolantie 12, Nurmijärvi";
	let invoice_items = [];
	let header = [{
		bold: true,
		text: "Nimike"
	}, {
		bold: true,
		text: "Määrä"
	}, {
		bold: true,
		text: "à hinta"
	}, {
		bold: true,
		text: "Alv %"
	}, {
		bold: true,
		text: "Yhteensä"
	}];



	invoice_items.push(header);

	// console.log( data.invoice_items);
	let totalAmount = 0;
	data.invoice_items.forEach(function(obj) {
		let item = obj;
		let row = [];
		row.push({
			bold: true,
			text: "" + item.description
		});
		row.push("" + item.quantity);
		row.push("" + item.price);
		row.push("" + item.vat);
		let rowSum = (item.quantity * item.price);
		totalAmount += rowSum;
		row.push("" + rowSum);
		// console.log(row);
		invoice_items.push(row);
	});

	let footer = ["", "", "", "", ""+totalAmount];
	invoice_items.push(footer);
	console.log(invoice_items.slice(0));

	let currentUser = "Printed by User " + Meteor.user().toString();

	var docDefinition = {
		pageSize: 'A4',
		pageMargins: [30, 25, 30, 25],

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
					companyAddress3
				]
			}, {
				width: '20%',
				text: [{
					style: "listLabel",
					text: "Lasku\n"
				}, "Päiväys\n", "1.1.2016"],
				style: ['listItem']
			}, {
				width: '*',
				text: [{
					style: "listLabel",
					text: "Lasku nro\n"
				}, "#1001"],
				style: ['listItem']
			}],
			columnGap: 10
		}, {
			text: "\n\n"
		}, {
			columns: [{
				width: '35%',
				style: ['listItem'],
				text: [{
						style: "listLabel",
						text: "Laskutusasiakas"
					},
					"\n",
					customerAdress1,
					"\n",
					customerAdress2,
					"\n",
					customerAdress3,
					"\n",
					customerAdress4
				]
			}, {
				width: '20%',
				text: [{
					style: "listLabel",
					text: "Laskutusasiakas\n"
				}, "Maksuehto\n", "Eräpäivä\n", "\n\n", "Viitteemme\n", "Viitteenne\n", "\n", "Toimitusaika"],
				style: ['listLabel']
			}, {
				width: '*',
				text: ["24 pv netto\n", "22.05.2015\n", "\n\n", "Nurmijärven Sähkö Oy\n", "Vuokrasop. 12.4.2012\n", "\n", "1.1.-31.1.2013"],
				style: ['listItem']
			}],
			columnGap: 10
		}, {
			text: "\n\n"
		}, {
			text: note,
		}, {
			text: "\n"
		}, { // invoice_items rows
			table: {
				headerRows: 1,
				widths: ['*', 'auto', 'auto', 'auto', 'auto'],

				body: invoice_items


			},
			layout: 'lightHorizontalLines'
		}],

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
			}
		}
	};


	// Start the pdf-generation process 
	pdfMake.createPdf(docDefinition).open();
}
