import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {Observable} from "rxjs/Observable"
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class TestsService {

    tests: Observable<any[]>;
    private _tests: BehaviorSubject<any[]>;
    private dataStore: {
        tests: any[]
    };

    success = undefined;

    constructor(private http: Http) {
        this.dataStore = { tests: [] };
        this._tests = <BehaviorSubject<any[]>>new BehaviorSubject([]);
        this.tests = this._tests.asObservable();
    }

    headers = new Headers({"Content-Type": "application/json"});
    options = new RequestOptions({ headers: this.headers });

    url = 'http://localhost:8081/';

    getAll() {
        this.http.get(this.url + 'get_tests')
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(data => {
            this.dataStore.tests = data;
            this._tests.next(Object.assign({}, this.dataStore).tests);
          });
    }

    getTest(id) {
        return this.http.get(this.url + 'tests/' + id)
        .map((response: Response) => response.json())
        .catch(this.handleError);
    }

    create(test, discipline, topic) {
        this.success = undefined;
        
        let test_name = test.name,
            id_discipline = test.id_discipline,
            id_topic = test.id_topic,
            amount_tasks = test.amount_tasks, 
            timer = test.timer, 
            date = test.date, 
            creator = test.creator;


        this.http.post(this.url + 'add_test', JSON.stringify(test), this.options)
        .map((response: Response) => response.json())
        .catch(this.handleError)
        .subscribe(data => {
            console.log(data);
            data.success = JSON.parse(data.success);
            this.success = data.success;
            if(data.success) { 
                this.dataStore.tests.push({id_test: data.id, test_name: test_name, topic: topic, discipline: discipline, id_discipline: id_discipline, id_topic: id_topic, amount_tasks: data.amount, timer: timer, date: date, creator: creator});
                console.log(this.dataStore.tests);
                this._tests.next(Object.assign({}, this.dataStore).tests);
            }
          });
    }

    delete(test) {
        this.success = undefined;
        this.http.delete(this.url + 'delete_test', new RequestOptions({
            headers: this.headers,
            body: JSON.stringify(test)
         }))
         .map((response: Response) => response.json())
         .catch(this.handleError)
         .subscribe(
            data => {
                console.log(data);
                data.success = JSON.parse(data.success);
                this.success = data.success;
                if(data.success) { 
                    this.dataStore.tests = this.dataStore.tests.filter(tests => tests !== test);
                    this._tests.next(Object.assign({}, this.dataStore).tests);
                } 
            });
    }

    saveResult(result): void {
        this.http.post(this.url + 'save_result', JSON.stringify(result), this.options).subscribe(res => console.log(res));
    }

    getStats(username): Observable<any> {
        return this.http.post(this.url + 'get_statistic', JSON.stringify(username), this.options)
            .map((response: Response) => response.json());
    }

    private handleError(error: any) {
        console.error('Error', error);
        return Observable.throw(error.message || error);
    }
}