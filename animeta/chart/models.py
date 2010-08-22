# -*- coding: utf-8 -*-

import datetime
import itertools
from django.db import models
from django.contrib.auth.models import User
from work.models import Work
from chart.utils import *

def rank(iterable):
	rank = 0
	prev = -1
	ptr = 1
	max = None

	for object in iter(iterable):
		if prev != object.factor:
			rank = ptr
		prev = object.factor
		ptr += 1
		max = max or object.factor
		yield {
			'rank': rank,
			'object': object,
			'factor': object.factor,
			'factor_percent': float(object.factor) / max * 100.0
		}

class Chart(object):
	def __init__(self, range = None, limit=None):
		self.range = range
		self.limit = limit
		self.queryset = None

	@property
	def start(self):
		return self.range[0]

	@property
	def end(self):
		return self.range[1]

	def __iter__(self):
		if not self.queryset:
			self.queryset = self.get_query_set().filter(factor__gt=1)[:self.limit]

		return rank(self.queryset)

	def get_query_set(self):
		raise NotImplementedError

def compare_charts(a, b):
	return DifferenceChart(a, b)

class DifferenceChart(Chart):
	def __init__(self, chart, past_chart):
		self.chart = chart
		self.past_chart = past_chart
		super(DifferenceChart, self).__init__(chart.range, chart.limit)

	def __iter__(self):
		past_chart_dict = {}
		for item in self.past_chart:
			past_chart_dict[item['object'].id] = item['rank']
		
		for item in self.chart:
			if item['object'].id not in past_chart_dict:
				item['diff'] = None
			else:
				diff = past_chart_dict[item['object'].id] - item['rank']
				item['diff'] = abs(diff)
				item['sign'] = cmp(diff, 0)
			yield item

class PopularWorksChart(Chart):
	title = u'인기 작품'
	def get_query_set(self):
		qs = Work.objects
		if self.range:
			qs = qs.filter(history__updated_at__range=self.range)
			group_by = 'history__user'
		else:
			group_by = 'record'
		return qs.exclude(title='').annotate(factor=models.Count(group_by, distinct=True)).order_by('-factor', 'title')

class ActiveUsersChart(Chart):
	title = u'활발한 사용자'
	def get_query_set(self):
		qs = User.objects
		if self.range:
			qs = qs.filter(history__updated_at__range=self.range)
		return qs.annotate(factor=models.Count('history')).order_by('-factor', 'username')

def during(**kwargs):
	now = datetime.datetime.now()
	start = now - datetime.timedelta(**kwargs)
	return (start, now)

def weekly():
	today = datetime.date.today()
	# 오늘이 금요일(weekday=4)이라면, weekday+2일 전은 토요일.
	weekday = today.weekday()
	if weekday == 6: weekday = -1
	end = today - datetime.timedelta(days=weekday + 2)
	start = end - datetime.timedelta(days=6)
	return (datetime.datetime(start.year, start.month, start.day),
			datetime.datetime(end.year, end.month, end.day, 23, 59, 59))

def past_week():
	start, end = weekly()
	week_delta = datetime.timedelta(weeks=1)
	return (start - week_delta, end - week_delta)

def monthly():
	today = datetime.date.today()
	prev = prev_month(today.year, today.month)
	return month_range(*prev)

def past_month():
	today = datetime.date.today()
	prev = prev_month(today.year, today.month)
	return month_range(*prev_month(*prev))
