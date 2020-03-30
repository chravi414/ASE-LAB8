import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  books: any;
  displayedColumns = ['isbn', 'title', 'author', 'details', 'update', 'delete'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  result: any;
  constructor(private api: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.getBooks();
  }

  public getBooks() {
    this.api.getBooks()
      .subscribe(res => {
        console.log(res);
        this.books = res;
        this.dataSource = new MatTableDataSource(this.books);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, err => {
        console.log(err);
      });
  }

  public doFilter = (event: Event) => {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public redirectToDetails = (id: string) => {
    this.router.navigate([`/book-details/${id}`]);
  }

  public redirectToUpdate = (id: string) => {
    this.router.navigate([`/book-edit/${id}`]);
  }

  public redirectToDelete = (id: string) => {
    const response = this.confirmDialog(id);
  }

  public deleteBook(id) {
    this.api.deleteBook(id)
      .subscribe(res => {
        this.getBooks();
        this.openSnackBar('Deleted the book successfully');
        // console.log(this.paginator);
        // this.paginator.page.next({
        //   pageIndex: this.paginator.pageIndex,
        //   pageSize: this.paginator.pageSize,
        //   length: this.paginator.length
        // });
      }, (err) => {
        console.log(err);
      });
  }

  openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  confirmDialog(id) {
    const message = `Are you sure you want to do this?`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteBook(id);
      }
    })
  }
}

export class BookDataSource extends DataSource<any> {
  constructor(private api: ApiService) {
    super();
  }

  connect() {
    return this.api.getBooks();
  }

  disconnect() {

  }

  filter() {

  }
}
