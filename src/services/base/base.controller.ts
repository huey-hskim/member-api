// base.controller.ts

import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseSelectResDto, BaseInsertResDto, BaseUpdateResDto, BaseDeleteResDto } from './base.dto';

export abstract class BaseController<
  T,
  S extends {
    findAll(): Promise<T[]>;
    findByNo(no: number): Promise<T | null>;
    insert(data: Partial<T>): Promise<any>;
    update(data: Partial<T> & { no: number }): Promise<any>;
    delete(no: number): Promise<any>;
  }
> {
  protected constructor(protected readonly service: S) {}

  @Get()
  @ApiOperation({ summary: '전체 조회' })
  @ApiResponse({ status: 200, description: '성공', type: BaseSelectResDto<T> })
  async findAll(): Promise<T[]> {
    return this.service.findAll();
  }

  @Get(':no')
  @ApiOperation({ summary: '단일 조회' })
  @ApiResponse({ status: 200, description: '성공', type: BaseSelectResDto<T> })
  async findByNo(@Param('no') no: number): Promise<T | null> {
    return this.service.findByNo(no);
  }

  @Post()
  @ApiOperation({ summary: '생성' })
  @ApiResponse({ status: 200, description: '생성 성공', type: BaseInsertResDto })
  async insert(@Body() data: Partial<T>) {
    return this.service.insert(data);
  }

  @Put(':no')
  @ApiOperation({ summary: '수정' })
  @ApiResponse({ status: 200, description: '수정 성공', type: BaseUpdateResDto })
  async update(@Param('no') no: number, @Body() data: Partial<T>) {
    return this.service.update({ ...data, no } as Partial<T> & { no: number });
  }

  @Delete(':no')
  @ApiOperation({ summary: '삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공', type: BaseDeleteResDto })
  async delete(@Param('no') no: number) {
    return this.service.delete(no);
  }
}
